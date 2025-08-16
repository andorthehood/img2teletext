#!/usr/bin/env node

import { program } from 'commander';
import img2teletext from './index';
import { PNG } from 'pngjs';
import * as jpeg from 'jpeg-js';
import * as fs from 'fs';
import { encode } from 'teletexthash';
import { fitToTeletextPage } from './teletextUtils';
import * as path from 'path';
import btoa from 'btoa';
import { version } from '../package.json';

interface ImageData {
	buffer: Uint8Array;
	width: number;
}

/**
 * Reads an image file and returns its buffer and width
 * @param file - Path to the image file
 * @returns Object containing the image buffer and width
 */
function getImageBufferAndWidth(file: string): ImageData {
	const fileBuffer = fs.readFileSync(file);

	switch (path.extname(file).toLowerCase()) {
		case '.jpeg':
		case '.jpg':
			const jpgData = jpeg.decode(fileBuffer);
			return {
				buffer: jpgData.data,
				width: jpgData.width,
			};
		case '.png':
			const pngData = PNG.sync.read(fileBuffer);
			return {
				buffer: pngData.data,
				width: pngData.width,
			};
		default:
			throw new Error(`Not supported file type: ${path.extname(file)}`);
	}
}

interface CliOptions {
	bin?: boolean;
	edittf?: boolean;
	zxnet?: boolean;
	base64?: boolean;
	json?: boolean;
	hash?: boolean;
}

/**
 * Main CLI action handler
 * @param file - Image file path
 * @param options - CLI options
 */
function handleCommand(file: string, options: CliOptions): void {
	if (!file) {
		console.error('Error: No file specified');
		process.exit(1);
	}

	let imageData: ImageData;
	
	try {
		imageData = getImageBufferAndWidth(file);
	} catch (error) {
		console.error(`Error reading file: ${error instanceof Error ? error.message : error}`);
		process.exit(1);
	}

	const teletextBuffer = fitToTeletextPage(
		img2teletext(imageData.buffer, imageData.width),
		imageData.width / 2
	);

	const teletextHash = encode(teletextBuffer);

	if (options.edittf) {
		process.stdout.write(`http://edit.tf/${teletextHash}`);
	} else if (options.zxnet) {
		process.stdout.write(`https://zxnet.co.uk/teletext/editor/${teletextHash}\n`);
	} else if (options.hash) {
		process.stdout.write(teletextHash + '\n');
	} else if (options.base64) {
		process.stdout.write(btoa(teletextBuffer) + '\n');
	} else if (options.bin) {
		process.stdout.write(teletextBuffer);
	} else if (options.json) {
		process.stdout.write(`[${teletextBuffer.toString()}]\n`);
	} else {
		// Default output format if no option is specified
		process.stdout.write(teletextBuffer);
	}
}

program
	.version(version)
	.argument('<file>', 'Image file to convert')
	.option('-b, --bin', 'Generate binary output.')
	.option('-e, --edittf', 'Generate edit.tf url.')
	.option('-z, --zxnet', 'Generate zxnet url.')
	.option('--base64', 'Generate base64.')
	.option('-j, --json', 'Generate JSON output.')
	.option('--hash', 'Generate edit.tf and zxnet compatible teletext hash.')
	.action(handleCommand);

program.parse(); 