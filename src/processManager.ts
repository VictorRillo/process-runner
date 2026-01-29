import * as vscode from "vscode";
import { spawn, ChildProcess } from "child_process";
import { getPidUsingPort, killProcessByPid } from "./portUtils";

export interface ProcessDefinition {
  id: string;
  title: string;
  command: string;
  cwd?: string;
  port?: number;
  group?: string;
}

interface RunningProcess {
  def: ProcessDefinition;
  proc?: ChildProcess;
  output: vscode.OutputChannel;
  hasError?: boolean;
  errorMessage?: string;
}

export class ProcessManager {
  private processes = new Map<string, RunningProcess>();

  constructor(
    defs: ProcessDefinition[],
    private onChange: () => void
  ) {
    defs.forEach(def => {
      this.processes.set(def.id, {
        def,
        output: vscode.window.createOutputChannel(def.title)
      });
    });
  }

  async start(id: string) {
    const p = this.processes.get(id);
    if (!p) {return;}
    
    // If a process is already running, don't start
    if (p.proc && !p.hasError) {return;}

    if (p.def.port) {
      const pid = await getPidUsingPort(p.def.port);
      if (pid) {
        vscode.window.showWarningMessage(
          `Port ${p.def.port} is in use. Kill process?`,
          "Yes",
          "No"
        ).then(async choice => {
          if (choice === "Yes") {
            await killProcessByPid(pid);
          } else {
            return;
          }
        });
      }
    }

    // Clear previous state
    p.output.clear();
    p.output.appendLine(`▶ Starting: ${p.def.command}`);
    p.hasError = false;
    p.errorMessage = undefined;
    p.proc = undefined;

    const proc = spawn(p.def.command, {
      cwd: p.def.cwd,
      shell: true,
      detached: true
    });

    p.proc = proc;
    this.onChange();

    proc.stdout?.on("data", d => p.output.append(d.toString()));
    proc.stderr?.on("data", d => p.output.append(d.toString()));

    proc.on("error", err => {
      p.hasError = true;
      p.errorMessage = err.message;
      p.output.appendLine(`❌ Error: ${err.message}`);
      p.proc = undefined;
      this.onChange();
      vscode.window.showErrorMessage(`Error launching ${p.def.title}: ${err.message}`);
    });

    proc.on("exit", code => {
      if (code !== 0 && code !== null) {
        p.hasError = true;
        p.errorMessage = `Exited with code ${code}`;
        p.output.appendLine(`❌ Exited with code ${code}`);
      } else {
        p.output.appendLine(`■ Exited with code ${code}`);
      }
      p.proc = undefined;
      this.onChange();
    });
  }

  stop(id: string) {
    const p = this.processes.get(id);
    if (!p?.proc) {return;}

    p.output.appendLine("■ Stopping...");
    try {
      if (p.proc.pid !== undefined) {
        if (process.platform === "win32") {
          spawn("taskkill", ["/PID", p.proc.pid.toString(), "/T", "/F"]);
        } else {
          process.kill(-p.proc.pid, "SIGTERM");
        }
      } else {
        p.output.appendLine("■ Unable to stop process: PID is undefined.");
      }
    } catch {}
    p.proc = undefined;
    this.onChange();
  }

  startAll() {
    this.processes.forEach((_, id) => this.start(id));
  }

  stopAll() {
    this.processes.forEach((_, id) => this.stop(id));
  }

  startGroup(groupName: string) {
    this.processes.forEach((p, id) => {
      if (p.def.group === groupName) {
        this.start(id);
      }
    });
  }

  stopGroup(groupName: string) {
    this.processes.forEach((p, id) => {
      if (p.def.group === groupName) {
        this.stop(id);
      }
    });
  }

  showLog(id: string) {
    this.processes.get(id)?.output.show();
  }

  async killPort(id: string) {
    const p = this.processes.get(id);
    if (!p?.def.port) {return;}
    const pid = await getPidUsingPort(p.def.port);
    if (pid) {
      await killProcessByPid(pid);
      vscode.window.showInformationMessage(
        `Killed process using port ${p.def.port}`
      );
    } else {
      vscode.window.showInformationMessage("Port not in use");
    }
  }

  isRunning(id: string): boolean {
    return !!this.processes.get(id)?.proc;
  }

  getErrorState(id: string): { hasError: boolean; message?: string } {
    const p = this.processes.get(id);
    return {
      hasError: p?.hasError || false,
      message: p?.errorMessage
    };
  }

  clearError(id: string) {
    const p = this.processes.get(id);
    if (p) {
      p.hasError = false;
      p.errorMessage = undefined;
      p.proc = undefined;
      this.onChange();
    }
  }

  getDefinitions(): ProcessDefinition[] {
    return [...this.processes.values()].map(p => p.def);
  }
}
