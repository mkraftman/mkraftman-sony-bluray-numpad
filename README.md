# Mkraftman Sony Blu-ray Numpad

Custom HACS Lovelace card for Sony Blu-ray numeric input via `rest_command`.

## Features

- Dialpad icon that opens a custom numpad overlay
- Sends digits 0-9 as individual `rest_command` calls to the Sony Blu-ray player
- Backspace sends "return" command to undo the last entry
- Tap outside numpad to dismiss
- iOS-style keyboard appearance with rounded corners

## Installation

1. Add this repository to HACS as a custom repository
2. Install the card
3. Add to your dashboard

## Prerequisites

You must have `rest_command` services configured for your Sony Blu-ray player:

- `rest_command.sony_bluray_num0` through `rest_command.sony_bluray_num9`
- `rest_command.sony_bluray_return`

## Configuration

```yaml
type: custom:mkraftman-sony-bluray-numpad
```
