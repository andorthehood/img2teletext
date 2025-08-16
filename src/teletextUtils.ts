import {
	TELETEXT_CHARACTER_HEIGHT,
	TELETEXT_CHARACTER_WIDTH,
	TELETEXT_EMPTY_CHARACTER
} from './consts';

import { forEachPixel, getImageHeight } from './imageUtils';

export type TeletextCoordinates = [number, number];
export type PixelCallback = (pixel: number[]) => boolean;
export type SegmentCallback = (teletextRow: number, teletextCol: number, segmentRow: number, segmentCol: number, color: number[]) => void;
export type CharacterCallback = (row: number, col: number, character: number, index: number) => void;

/**
 * Converts image pixel coordinates to teletext character coordinates.
 * @param x - The x-coordinate in the image
 * @param y - The y-coordinate in the image
 * @returns A tuple [row, col] representing the teletext character position
 */
export const translateImageCoordinatesToTeletext = function(x: number, y: number): TeletextCoordinates {
	return [
		Math.floor(y / TELETEXT_CHARACTER_HEIGHT),
		Math.floor(x / TELETEXT_CHARACTER_WIDTH),
	];
};

/**
 * Gets the segment coordinates within a teletext character.
 * Each teletext character is divided into 2x3 segments.
 * @param x - The x-coordinate in the image
 * @param y - The y-coordinate in the image
 * @returns A tuple [segmentRow, segmentCol] within the character (0-2, 0-1)
 */
export const getSegmentCoordinates = function(x: number, y: number): TeletextCoordinates {
	return [y % TELETEXT_CHARACTER_HEIGHT, x % TELETEXT_CHARACTER_WIDTH];
};

/**
 * Converts a linear buffer position to 2D character coordinates.
 * @param position - The linear position in the buffer
 * @param width - The width of the buffer in characters
 * @returns A tuple [row, col] representing the 2D position
 */
export const getCharacterCoordinates = function(position: number, width: number): TeletextCoordinates {
	const row = Math.floor(position / width);
	const col = position - row * width;
	return [row, col];
};

/**
 * Calculates the height of a 2D buffer given its width.
 * @param buffer - The buffer to measure
 * @param width - The width of the buffer
 * @returns The height of the buffer in rows
 */
export const getHeight = function(buffer: Uint8Array, width: number): number {
	return Math.ceil(buffer.length / width);
};

/**
 * Checks if a cell exists within the bounds of a 2D buffer.
 * @param row - The row coordinate to check
 * @param col - The column coordinate to check
 * @param buffer - The buffer to check bounds against
 * @param width - The width of the buffer
 * @returns True if the cell exists within bounds, false otherwise
 */
export const isCellExitsts = function(row: number, col: number, buffer: Uint8Array, width: number): boolean {
	return col < width && row < getHeight(buffer, width);
};

/**
 * Converts 2D coordinates to a linear buffer position.
 * @param row - The row coordinate
 * @param col - The column coordinate
 * @param buffer - The buffer (used for type consistency, not accessed)
 * @param width - The width of the buffer
 * @returns The linear position in the buffer
 */
export const getCellPositionInBuffer = function(row: number, col: number, buffer: Uint8Array, width: number): number {
	return row * width + col;
};

/**
 * Gets a cell value from a 2D buffer using row and column coordinates.
 * @param row - The row coordinate
 * @param col - The column coordinate
 * @param buffer - The buffer to read from
 * @param width - The width of the buffer
 * @returns The value at the specified position
 */
export const getCell = function(row: number, col: number, buffer: Uint8Array, width: number): number {
	return buffer[getCellPositionInBuffer(row, col, buffer, width)];
};

/**
 * Calculates the teletext dimensions needed to represent an image.
 * @param pngWidth - The width of the source image in pixels
 * @param pngHeight - The height of the source image in pixels
 * @returns A tuple [rows, cols] representing the teletext grid dimensions
 */
export const getTeletextDimensions = function(pngWidth: number, pngHeight: number): TeletextCoordinates {
	return [
		Math.ceil(pngHeight / TELETEXT_CHARACTER_HEIGHT),
		Math.ceil(pngWidth / TELETEXT_CHARACTER_WIDTH),
	];
};

/**
 * Iterates over each pixel segment in an image, calling a callback for each.
 * Each pixel is mapped to its corresponding teletext character and segment position.
 * @param imageBuffer - The raw image data buffer
 * @param numberOfChannels - The number of color channels per pixel (typically 4 for RGBA)
 * @param imageWidth - The width of the image in pixels
 * @param callback - Function called for each segment with teletext coordinates and pixel data
 */
export const forEachSegment = function(
	imageBuffer: Uint8Array,
	numberOfChannels: number,
	imageWidth: number,
	callback: SegmentCallback
): void {
	forEachPixel(
		imageBuffer,
		imageWidth,
		function(x: number, y: number, color: number[]): void {
			const [
				teletextRow,
				teletextCol,
			] = translateImageCoordinatesToTeletext(x, y);
			const [segmentRow, segmentCol] = getSegmentCoordinates(x, y);

			callback(teletextRow, teletextCol, segmentRow, segmentCol, color);
		},
		numberOfChannels
	);
};

/**
 * Iterates over each character in a teletext buffer, calling a callback for each.
 * @param teletextBuffer - The teletext character buffer
 * @param width - The width of the teletext grid in characters
 * @param callback - Function called for each character with its position and value
 */
export const forEachCharacter = function(teletextBuffer: Uint8Array, width: number, callback: CharacterCallback): void {
	for (let i = 0; i < teletextBuffer.length; i++) {
		const [row, col] = getCharacterCoordinates(i, width);
		const character = teletextBuffer[i];
		callback(row, col, character, i);
	}
};

/**
 * Fits a teletext buffer to the standard teletext page dimensions (40x25).
 * Any content that exceeds these dimensions is cropped.
 * @param teletextBuffer - The source teletext buffer
 * @param originalWidth - The width of the original buffer in characters
 * @returns A new buffer sized to 40x25 characters with content copied from the original
 */
export const fitToTeletextPage = function(teletextBuffer: Uint8Array, originalWidth: number): Uint8Array {
	const cropped = new Uint8Array(25 * 40).fill(TELETEXT_EMPTY_CHARACTER);

	forEachCharacter(cropped, 40, function(row: number, col: number): void {
		if (isCellExitsts(row, col, teletextBuffer, originalWidth)) {
			const pos = getCellPositionInBuffer(row, col, cropped, 40);
			cropped[pos] = getCell(row, col, teletextBuffer, originalWidth);
		}
	});
	return cropped;
};

/**
 * Converts an image buffer to teletext representation using mosaic characters.
 * Each 2x3 pixel block in the image becomes a teletext mosaic character.
 * @param imageBuffer - The raw image data buffer
 * @param numberOfChannels - The number of color channels per pixel (typically 4 for RGBA)
 * @param imageWidth - The width of the image in pixels
 * @param callback - Function that determines if a pixel should be "on" or "off" in the mosaic
 * @returns A teletext buffer containing mosaic character codes
 */
export const mapImageToTeletext = function(
	imageBuffer: Uint8Array,
	numberOfChannels: number,
	imageWidth: number,
	callback: PixelCallback
): Uint8Array {
	const imageHeight = getImageHeight(
		imageBuffer,
		imageWidth,
		numberOfChannels
	);
	const [teletextRows, teletextCols] = getTeletextDimensions(
		imageWidth,
		imageHeight
	);

	const teletextBuffer = new Uint8Array(teletextRows * teletextCols).fill(
		TELETEXT_EMPTY_CHARACTER
	);

	forEachSegment(imageBuffer, numberOfChannels, imageWidth, function(
		teletextRow: number,
		teletextCol: number,
		segmentRow: number,
		segmentCol: number,
		pixel: number[]
	): void {
		const position = teletextRow * teletextCols + teletextCol;
		const character = teletextBuffer[position];

		teletextBuffer[position] = callback(pixel)
			? setMosaicCharacterSegment(character, segmentRow, segmentCol)
			: character;
	});

	return teletextBuffer;
};

/**
 * Sets a specific segment within a teletext mosaic character.
 * Teletext mosaic characters use a 2x3 grid where each segment can be on or off.
 * The bit pattern follows teletext standard encoding.
 * @param character - The current character value
 * @param row - The row within the character (0-2)
 * @param col - The column within the character (0-1)
 * @returns The character with the specified segment bit set
 */
export const setMosaicCharacterSegment = function(character: number, row: number, col: number): number {
	const mask = col === 1 && row === 2 ? 1 << 6 : 1 << (col + row * 2);
	return (character |= mask);
}; 