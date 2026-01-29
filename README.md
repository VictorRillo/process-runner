# Process Runner

Process Runner is a Visual Studio Code extension that allows you to define,
run, and manage multiple development processes directly from VS Code.

## Features

- Run multiple processes in parallel
- Start / stop individual processes
- Start / stop all processes
- Live logs per process
- Define a port per process
- Detect if a port is already in use
- Kill external processes using a port
- Automatic cleanup when VS Code closes

## Configuration

Define your processes in `.vscode/settings.json`:

```json
{
  "processRunner.processes": [
    {
      "id": "backend",
      "title": "Backend API",
      "command": "npm run dev",
      "cwd": "backend",
      "port": 3000
    }
  ]
}
