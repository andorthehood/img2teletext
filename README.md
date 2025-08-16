# img2teletext

This is a CLI application for converting images to teletext level 1 compatible data. Starting from the upper leftmost, the algorithm goes by 2x3 blocks of pixels, and translates them to teletext mosaic charachters. It can also be used as a Node.js library.

![poes]

[poes]: poes.gif

It handles images of any dimensions, they don't have to be within the constraints of a standard teletext page.

## Requirements

- Node.js v14 or newer (recommended: v18 or newer)
- npm v6 or newer (comes with Node.js)

## Installation

This module is distributed via npm.

```bash
$ npm install -g img2teletext
```

## Command Line Usage

### Basic Usage

```bash
$ img2teletext <image-file> [options]
```

### Options

- `-V, --version` - Output the version number
- `-b, --bin` - Generate binary output (default)
- `-e, --edittf` - Generate edit.tf URL for online teletext editor
- `-z, --zxnet` - Generate ZXNet URL for online teletext editor
- `--base64` - Generate base64 encoded output
- `-j, --json` - Generate JSON array output
- `--hash` - Generate teletext hash for edit.tf and zxnet compatibility
- `-h, --help` - Display help information

### Examples

```bash
# Convert image to binary teletext data (default output)
$ img2teletext image.png

# Generate a JSON array of teletext character codes
$ img2teletext image.png --json

# Generate a shareable edit.tf URL
$ img2teletext image.png --edittf

# Generate a shareable ZXNet URL
$ img2teletext image.png --zxnet

# Generate base64 encoded data
$ img2teletext image.png --base64

# Generate teletext hash for compatibility
$ img2teletext image.png --hash
```

### Supported Image Formats

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)

## Using it as a Node.js library

### JavaScript (ES5/CommonJS)
```javascript
const img2teletext = require('img2teletext').default;
const { PNG } = require('pngjs');
const fs = require('fs');

const data = fs.readFileSync('./test/test.png');
const png = PNG.sync.read(data);
const teletextData = img2teletext(png.data, png.width);

console.log(teletextData);
```

### TypeScript
```typescript
import img2teletext from 'img2teletext';
import { PNG } from 'pngjs';
import fs from 'fs';

const data = fs.readFileSync('./test/test.png');
const png = PNG.sync.read(data);
const teletextData: Uint8Array = img2teletext(png.data, png.width);

console.log(teletextData);
```

## Development

This project is written in TypeScript. To build the project:

```bash
npm install
npm run build
```

To run tests:

```bash
npm test
```

To watch for changes during development:

```bash
npm run dev
```

This code is released under the MIT license, feel free to do whatever you want with it.
