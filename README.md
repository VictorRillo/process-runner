# Process Runner

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=VictorRillo.process-runner)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Process Runner is a powerful Visual Studio Code extension that allows you to define, run, and manage multiple development processes directly from your IDE. Perfect for full-stack development, microservices, and complex workflows.

## ✨ Features

- **🚀 Process Management**: Run multiple processes in parallel with individual start/stop controls
- **📊 Live Monitoring**: Real-time logs and status indicators for each process
- **🔌 Port Management**: Automatic port detection and conflict resolution
- **🗂️ Process Grouping**: Organize related processes into logical groups
- **🧹 Auto Cleanup**: Automatically terminates processes when VS Code closes
- **⚡ Quick Actions**: Start/stop all processes or entire groups with one click

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)
3. Search for "Process Runner"
4. Click **Install**

### From VSIX File
1. Download the latest `.vsix` file from the [Releases](https://github.com/VictorRillo/process-runner/releases) page
2. Open VS Code
3. Press `Ctrl+Shift+P` and type "Extensions: Install from VSIX"
4. Select the downloaded file

## ⚙️ Configuration

Define your processes in `.vscode/settings.json`:

### Basic Configuration

```json
{
  "processRunner.processes": [
    {
      "id": "backend",
      "title": "Backend API",
      "command": "npm run dev",
      "cwd": "backend",
      "port": 3000
    },
    {
      "id": "frontend",
      "title": "Frontend App",
      "command": "npm start",
      "cwd": "frontend",
      "port": 3001
    }
  ]
}
```

### Advanced Configuration with Groups

```json
{
  "processRunner.processes": [
    {
      "id": "api",
      "title": "API Server",
      "command": "npm run dev",
      "cwd": "services/api",
      "port": 3000,
      "group": "backend"
    },
    {
      "id": "database",
      "title": "Database",
      "command": "docker-compose up -d postgres",
      "cwd": "services",
      "group": "backend"
    },
    {
      "id": "web",
      "title": "Web App",
      "command": "npm run dev",
      "cwd": "apps/web",
      "port": 3001,
      "group": "frontend"
    },
    {
      "id": "mobile",
      "title": "Mobile App",
      "command": "npm run expo",
      "cwd": "apps/mobile",
      "group": "frontend"
    }
  ],
  "processRunner.enableGrouping": true
}
```

### Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier for the process |
| `title` | string | ✅ | Display name shown in the UI |
| `command` | string | ✅ | Command to execute |
| `cwd` | string | ❌ | Working directory (relative to workspace) |
| `port` | number | ❌ | Port number to monitor for conflicts |
| `group` | string | ❌ | Group name for organizing related processes |

## 🎯 Usage

### Accessing Process Runner

1. **Activity Bar**: Click the Process Runner icon in the activity bar
2. **Command Palette**: Press `Ctrl+Shift+P` and search for "Process Runner"

### Available Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `processRunner.start` | - | Start a specific process |
| `processRunner.stop` | - | Stop a specific process |
| `processRunner.startAll` | - | Start all configured processes |
| `processRunner.stopAll` | - | Stop all running processes |
| `processRunner.startGroup` | - | Start all processes in a group |
| `processRunner.stopGroup` | - | Stop all processes in a group |
| `processRunner.showLog` | - | View live logs for a process |
| `processRunner.killPort` | - | Kill external process using a port |

### Process Status Indicators

- **🟢 Running**: Process is currently running
- **🔴 Stopped**: Process is not running
- **⚠️ Port In Use**: Port conflict detected
- **❌ Error**: Process failed to start

## 🚀 Quick Start Examples

### Full-Stack Web Development

```json
{
  "processRunner.processes": [
    {
      "id": "postgres",
      "title": "PostgreSQL",
      "command": "docker-compose up -d postgres",
      "cwd": "docker",
      "group": "database"
    },
    {
      "id": "redis",
      "title": "Redis Cache",
      "command": "docker-compose up -d redis",
      "cwd": "docker",
      "group": "database"
    },
    {
      "id": "api",
      "title": "Express API",
      "command": "npm run dev",
      "cwd": "backend",
      "port": 3000,
      "group": "backend"
    },
    {
      "id": "worker",
      "title": "Background Worker",
      "command": "npm run worker",
      "cwd": "backend",
      "group": "backend"
    },
    {
      "id": "react",
      "title": "React App",
      "command": "npm start",
      "cwd": "frontend",
      "port": 3001,
      "group": "frontend"
    }
  ]
}
```

### Microservices Architecture

```json
{
  "processRunner.processes": [
    {
      "id": "auth-service",
      "title": "Auth Service",
      "command": "go run main.go",
      "cwd": "services/auth",
      "port": 8001,
      "group": "core-services"
    },
    {
      "id": "user-service",
      "title": "User Service",
      "command": "go run main.go",
      "cwd": "services/user",
      "port": 8002,
      "group": "core-services"
    },
    {
      "id": "notification-service",
      "title": "Notification Service",
      "command": "python app.py",
      "cwd": "services/notification",
      "port": 8003,
      "group": "support-services"
    }
  ]
}
```

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/VictorRillo/process-runner.git
cd process-runner

# Install dependencies
npm install

# Compile in development mode
npm run compile

# Package for distribution
npm run package

# Create VSIX package
vsce package
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run watch-tests
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Process fails to start:**
- Check that the command is correct and executable
- Verify the working directory exists
- Ensure all required dependencies are installed

**Port conflicts:**
- Use the "Kill Process Using Port" command to free up ports
- Change the port in your configuration
- Check if another application is using the port

**Extension not showing:**
- Reload VS Code (`Ctrl+Shift+P` → "Developer: Reload Window")
- Check that the extension is enabled in the Extensions panel

### Getting Help

- 📖 [Documentation](https://github.com/VictorRillo/process-runner/wiki)
- 🐛 [Report Issues](https://github.com/VictorRillo/process-runner/issues)
- 💬 [Discussions](https://github.com/VictorRillo/process-runner/discussions)

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
