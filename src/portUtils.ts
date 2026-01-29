import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function getPidUsingPort(port: number): Promise<number | null> {
  try {
    if (process.platform === "win32") {
      const { stdout } = await execAsync(
        `netstat -ano | findstr :${port}`
      );
      const match = stdout.match(/\s+(\d+)\s*$/m);
      return match ? Number(match[1]) : null;
    } else {
      const { stdout } = await execAsync(`lsof -i :${port} -t`);
      const pid = stdout.trim();
      return pid ? Number(pid) : null;
    }
  } catch {
    return null;
  }
}

export async function killProcessByPid(pid: number): Promise<void> {
  if (process.platform === "win32") {
    await execAsync(`taskkill /PID ${pid} /F`);
  } else {
    await execAsync(`kill -9 ${pid}`);
  }
}
