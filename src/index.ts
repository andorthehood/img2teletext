import { mapImageToTeletext } from './teletextUtils';
import { avg } from './mathUtils';

const img2teletext = function(imageBuffer: Uint8Array, imageWidth: number, numberOfChannels: number = 4): Uint8Array {
	return mapImageToTeletext(
		imageBuffer,
		numberOfChannels,
		imageWidth,
		function(pixel: number[]): boolean {
			return avg(...pixel) > 0x80;
		}
	);
};

export * from './teletextUtils';
export default img2teletext; 