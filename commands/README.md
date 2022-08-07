# Commands folder

This folder contains all the slash commands.

## File Contents

Below is a table showing the usefulness of each command:

| Command | Utility |
|---|---|
| `command-fablab` | This command allows you to add a description, the estimated printing time or the final printing time. |
| `create-embed-message` | This command allows you to create a customizable message in Embed format. |
| `help` | This command sends a message containing all the commands and their usefulness. |
| `manage-channel` | This command manages the permissions of the Bot to a channel in order to limit the use of commands to authorized channels. |
| `role-reaction` | This command allows you to manage messages having a self-role by reacting with a specific emoji. |
| `site-fablab` | This command sends a message with two buttons which are links to the sites to place an order. |

Note that some commands require a channel and message ID to work.

## How It Works

Each file contains two elements:

- **data**: Contains the command elements (name, description, subcommand...).
- **execute()**: Is the function executed if this command is called.

## Server Integrations Page

Discord has added a page to manage roles and channels of slash commands.
Therefore if you are using this page, you can disable the `manage-channel` command.

This page can be found in the server settings => Integrations => Nestor.

Read more about [Integrations Page](https://support.discord.com/hc/fr/articles/360045093012).
