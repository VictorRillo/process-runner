import * as vscode from "vscode";
import { ProcessManager, ProcessDefinition } from "./processManager";
import { getPidUsingPort } from "./portUtils";

export class GroupItem extends vscode.TreeItem {
  constructor(
    public readonly groupName: string,
    public readonly processes: ProcessDefinition[],
    private readonly manager: ProcessManager
  ) {
    super(groupName, vscode.TreeItemCollapsibleState.Collapsed);
    
    const runningCount = processes.filter(p => manager.isRunning(p.id)).length;
    const totalCount = processes.length;
    
    // Icon and color based on state
    if (runningCount === totalCount) {
      this.iconPath = new vscode.ThemeIcon(
        "folder-active",
        new vscode.ThemeColor("testing.iconPassed")
      );
    } else if (runningCount > 0) {
      this.iconPath = new vscode.ThemeIcon(
        "folder-active",
        new vscode.ThemeColor("charts.orange")
      );
    } else {
      this.iconPath = new vscode.ThemeIcon("folder");
    }
    
    this.contextValue = "group";
    console.log(`GroupItem created with contextValue: ${this.contextValue}`);
    
    // Description with state counter
    this.description = `${runningCount}/${totalCount} active`;
    
    // Enhanced tooltip
    let tooltip = `Group: ${groupName}`;
    tooltip += `\n${runningCount} of ${totalCount} process${totalCount !== 1 ? 'es' : ''} active`;
    tooltip += "\n\nClick to expand/collapse";
    this.tooltip = tooltip;
  }
}

export class ProcessItem extends vscode.TreeItem {
  constructor(
    public readonly def: ProcessDefinition,
    running: boolean,
    public portInUse: boolean,
    public hasError: boolean = false,
    public errorMessage?: string
  ) {
    super(def.title, vscode.TreeItemCollapsibleState.None);

    // Main icon based on state with colors
    if (hasError) {
      this.iconPath = new vscode.ThemeIcon(
        "error",
        new vscode.ThemeColor("testing.iconFailed")
      );
    } else {
      this.iconPath = new vscode.ThemeIcon(
        running ? "pass-filled" : "circle-outline",
        running ? new vscode.ThemeColor("testing.iconPassed") : new vscode.ThemeColor("testing.iconQueued")
      );
    }

    // Context includes port and error state
    this.contextValue = hasError ? "error" : (running ? "running" : "stopped");
    if (portInUse && !running && !hasError) {
      this.contextValue += "|portInUse";
    }

    // Description with port and VERY VISIBLE state
    let description = "";
    
    // State first, highly visible
    if (hasError) {
      description = "🔴 Error";
    } else if (running) {
      description = "🟢 Active";
    } else {
      description = "⚪ Stopped";
    }
    
    // Then port
    if (def.port) {
      description += ` :${def.port}`;
      if (portInUse && !running && !hasError) {
        description += " ⚠️";
      }
    }
    
    this.description = description;

    // Enhanced tooltip
    let tooltip = def.title;
    if (hasError) {
      tooltip += "\n🔴 State: ERROR";
      if (errorMessage) {
        tooltip += `\n❌ ${errorMessage}`;
      }
    } else if (running) {
      tooltip += "\n🟢 State: ACTIVE";
    } else {
      tooltip += "\n⚪ State: STOPPED";
    }
    if (def.port) {
      tooltip += `\n🔌 Port: ${def.port}`;
      if (portInUse && !running && !hasError) {
        tooltip += " (occupied by another process)";
      }
    }
    tooltip += `\nCommand: ${def.command}`;
    if (hasError) {
      tooltip += "\n\n▶ Click to restart";
    } else {
      tooltip += running
        ? "\n\n↪ Click to view log"
        : "\n\n▶ Click to start";
    }
    this.tooltip = tooltip;

    this.command = {
      command: running
        ? "processRunner.showLog"
        : "processRunner.start",
      title: "Action",
      arguments: [this]
    };
  }
}

export class ProcessTreeProvider
  implements vscode.TreeDataProvider<ProcessItem | GroupItem> {

  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  private groupingEnabled: boolean = true;

  constructor(private manager: ProcessManager) {
    // Read grouping configuration
    const cfg = vscode.workspace.getConfiguration("processRunner");
    this.groupingEnabled = cfg.get<boolean>("enableGrouping", true);

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("processRunner.enableGrouping")) {
        const cfg = vscode.workspace.getConfiguration("processRunner");
        this.groupingEnabled = cfg.get<boolean>("enableGrouping", true);
        this.refresh();
      }
    });
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(item: ProcessItem | GroupItem) {
    return item;
  }

  async getChildren(element?: ProcessItem | GroupItem): Promise<(ProcessItem | GroupItem)[]> {
    const defs = this.manager.getDefinitions();

    // If an element is passed, it's a group and we return its children
    if (element instanceof GroupItem) {
      const items: ProcessItem[] = [];
      for (const def of element.processes) {
        let portInUse = false;
        if (def.port) {
          portInUse = !!(await getPidUsingPort(def.port));
        }
        const errorState = this.manager.getErrorState(def.id);
        items.push(
          new ProcessItem(def, this.manager.isRunning(def.id), portInUse, errorState.hasError, errorState.message)
        );
      }
      return items;
    }

    // If grouping is disabled, return all processes as a flat list
    if (!this.groupingEnabled) {
      const items: ProcessItem[] = [];
      for (const def of defs) {
        let portInUse = false;
        if (def.port) {
          portInUse = !!(await getPidUsingPort(def.port));
        }
        const errorState = this.manager.getErrorState(def.id);
        items.push(
          new ProcessItem(def, this.manager.isRunning(def.id), portInUse, errorState.hasError, errorState.message)
        );
      }
      return items;
    }

    // Group processes
    const grouped = new Map<string, ProcessDefinition[]>();
    const ungrouped: ProcessDefinition[] = [];

    for (const def of defs) {
      if (def.group) {
        if (!grouped.has(def.group)) {
          grouped.set(def.group, []);
        }
        grouped.get(def.group)!.push(def);
      } else {
        ungrouped.push(def);
      }
    }

    const result: (ProcessItem | GroupItem)[] = [];

    // Add groups
    for (const [groupName, processes] of grouped) {
      result.push(new GroupItem(groupName, processes, this.manager));
    }

    // Add ungrouped processes
    for (const def of ungrouped) {
      let portInUse = false;
      if (def.port) {
        portInUse = !!(await getPidUsingPort(def.port));
      }
      const errorState = this.manager.getErrorState(def.id);
      result.push(
        new ProcessItem(def, this.manager.isRunning(def.id), portInUse, errorState.hasError, errorState.message)
      );
    }

    return result;
  }
}
