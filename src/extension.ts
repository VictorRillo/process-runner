import * as vscode from "vscode";
import { ProcessManager } from "./processManager";
import { ProcessTreeProvider, ProcessItem, GroupItem } from "./processTreeProvider";

let manager: ProcessManager;

export function activate(context: vscode.ExtensionContext) {
  const cfg = vscode.workspace.getConfiguration("processRunner");
  const defs = cfg.get<any[]>("processes") || [];

  // Create the tree provider first
  let tree: ProcessTreeProvider;
  
  // Create manager with the correct callback
  manager = new ProcessManager(defs, () => {
    if (tree) {
      tree.refresh();
    }
  });
  
  // Now create the tree with the correct manager
  tree = new ProcessTreeProvider(manager);

  vscode.window.registerTreeDataProvider(
    "processRunnerView",
    tree
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "processRunner.start",
      async (item: ProcessItem) => {
        await manager.start(item.def.id);
        setTimeout(() => tree.refresh(), 100);
      }
    ),
    vscode.commands.registerCommand(
      "processRunner.stop",
      (item: ProcessItem) => {
        manager.stop(item.def.id);
        setTimeout(() => tree.refresh(), 100);
      }
    ),
    vscode.commands.registerCommand(
      "processRunner.showLog",
      (item: ProcessItem) => manager.showLog(item.def.id)
    ),
    vscode.commands.registerCommand(
      "processRunner.startAll",
      () => manager.startAll()
    ),
    vscode.commands.registerCommand(
      "processRunner.stopAll",
      () => manager.stopAll()
    ),
    vscode.commands.registerCommand(
      "processRunner.killPort",
      (item: ProcessItem) => manager.killPort(item.def.id)
    ),
    vscode.commands.registerCommand(
      "processRunner.startGroup",
      async (item: GroupItem) => {
        manager.startGroup(item.groupName);
        setTimeout(() => tree.refresh(), 100);
      }
    ),
    vscode.commands.registerCommand(
      "processRunner.stopGroup",
      (item: GroupItem) => {
        manager.stopGroup(item.groupName);
        setTimeout(() => tree.refresh(), 100);
      }
    )
  );
}

export function deactivate() {
  if (manager) {
    manager.stopAll();
  }
}
