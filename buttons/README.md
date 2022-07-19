# Buttons folder

This folder contains all the buttons that will be attached to the Webhook response message.

## File Contents

Below is a table showing the usefulness of each button:

| Button | Name | Utility |
|:---:|---|---|
| 🔽 | Download | Shows that the print file has been uploaded and is ready for printing. |
| 🖨 | Print | Shows that the part is being printed. |
| ✔ | Finish | Shows that the part has been successfully printed. |
| ⚠ | Default | Shows that the print had a fault. |
| ✖ | Error | Shows that there was an error either in the command (the form) or in the file or another error to be specified. |

## How It Works

Each file contains three elements:

- **data**: Contains the button elements (emoji, style and id)
- **indice**: Is the order of appearance of the buttons.
- **execute()**: Is the function executed if this button is pressed.

## Overview

A successful print gives a message like this:

![successful_embed](/docs/images/successful_embed.png)

Note that other informations such as a description, an image and the printing time can be added with [slash commands](/commands/README.md).
