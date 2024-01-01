# Cargo Bin 

> **VSCode Command Runner for any Cargo Crates CLI**

- A Quick ,and simple way to launch cargo crates cli / commands on Vscode

See Demo on youtube:

[![Watch the video](https://img.youtube.com/vi/GSry26wY7Tc/0.jpg)](https://youtu.be/GSry26wY7Tc)

## Usage

1. Press <kbd>CMD</kbd> +<kbd>SHIFT</kbd>+ <kbd>P</kbd> , select `Cargo Runner` , press <kbd>ENTER</kbd>
1. Pick among the listed Cargo Commands e.g. `cargo-nextest`,press <kbd>ENTER</kbd>
1. You will be shown `Commands` and `options` (prefix with --) , you can choose a command and press <kbd>ENTER</kbd> or immediately press <kbd>ENTER</kbd> to avoid choosing anything and do the manual overrides at the last step.
1. Last Step, Add any arguments you want e.g. `--package example --bin example -- test::test_fn`
