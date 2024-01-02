import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('cargo-bin.showCargoCommands', async () => {
        const cargoCommands = await getCargoCommands();
        if (!cargoCommands) {
            vscode.window.showErrorMessage('No cargo commands found or error occurred');
            return;
        }

        const selectedCommand = await vscode.window.showQuickPick(cargoCommands, {
            placeHolder: 'Select a cargo command',
        });

        if (selectedCommand) {
            const formattedCommand = formatCargoCommand(selectedCommand);
            const helpText = await executeCommandWithHelp(formattedCommand);
            const commands = parseCommands(helpText);
            const options = parseOptions(helpText);

            const selection = await vscode.window.showQuickPick(['', ...commands, ...options], {
                placeHolder: `Select a command or option for ${formattedCommand}`,
            });

            if (selection !== undefined) {
                const params = await vscode.window.showInputBox({
                    prompt: `Enter additional parameters for ${formattedCommand} ${selection}`
                });

                if (params !== undefined) {
                    const commandToRun = `${formattedCommand} ${selection} ${params}`;
                    const terminal = vscode.window.createTerminal(`${formattedCommand} Terminal`);
                    terminal.sendText(commandToRun.trim());
                    terminal.show();
                }
            }
        }
    });

    context.subscriptions.push(disposable);
}

function formatCargoCommand(command: string): string {
    return command.startsWith('cargo-') ? `cargo ${command.substring(6)}` : command;
}

async function getCargoCommands(): Promise<string[] | undefined> {
    try {
        let cargoBinPath = process.env.CARGO_HOME ? path.join(process.env.CARGO_HOME, 'bin') : path.join(process.env.HOME || '', '.cargo', 'bin');
        let files = fs.readdirSync(cargoBinPath);

        return files.filter(file => {
            let filePath = path.join(cargoBinPath, file);
            try {
                let stats = fs.statSync(filePath);
                return stats.isFile() && isExecutable(stats.mode);
            } catch {
                return false;
            }
        });
    } catch (error) {
        console.error('Error fetching cargo commands:', error);
        return undefined;
    }
}

function isExecutable(mode: number): boolean {
    return (mode & 0o111) > 0;
}

async function executeCommandWithHelp(command: string): Promise<string> {
    try {
        return child_process.execSync(`${command} --help`).toString();
    } catch (error) {
        console.error('Error executing command with --help:', error);
        return '';
    }
}

function parseCommands(helpText: string): Set<string> {
    const commands = new Set<string>();

    // Check if the help text contains a 'Commands:' section
    const commandSection = helpText.match(/Commands:\n([\s\S]*?)\n\n/);
    if (commandSection && commandSection[1]) {
        const commandLines = commandSection[1].trim().split('\n');
        commandLines.forEach(line => {
            const match = line.match(/^\s*(\w+)/);
            if (match) {
                commands.add(match[1]);
            }
        });
    }

    return commands;
}

function parseOptions(helpText: string): Set<string> {
    const optionRegex = /--\w[\w-]*(?=\s)/g;
    let match;
    const options = new Set<string>();
    while ((match = optionRegex.exec(helpText)) !== null) {
        options.add(match[0]);
    }
    return options;
}

export function deactivate() {}
