/**
 * Calculates the height of an image given its buffer, width, and number of channels
 * @param imageBuffer - The raw image data buffer
 * @param imageWidth - The width of the image in pixels
 * @param numberOfChannels - The number of color channels per pixel (typically 4 for RGBA)
 * @returns The height of the image in pixels
 */
export function getImageHeight(
  imageBuffer: Uint8Array,
  imageWidth: number,
  numberOfChannels: number
): number {
  const totalPixels = imageBuffer.length / numberOfChannels;
  return Math.floor(totalPixels / imageWidth);
}

/**
 * Iterates over each pixel in an image buffer, calling a callback for each pixel
 * @param imageBuffer - The raw image data buffer
 * @param imageWidth - The width of the image in pixels
 * @param callback - Function called for each pixel with x, y coordinates and color data
 * @param numberOfChannels - The number of color channels per pixel (typically 4 for RGBA)
 */
export function forEachPixel(
  imageBuffer: Uint8Array,
  imageWidth: number,
  callback: (x: number, y: number, color: number[]) => void,
  numberOfChannels: number
): void {
  const imageHeight = getImageHeight(imageBuffer, imageWidth, numberOfChannels);
  
  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const pixelIndex = (y * imageWidth + x) * numberOfChannels;
      const color: number[] = [];
      
      for (let channel = 0; channel < numberOfChannels; channel++) {
        color.push(imageBuffer[pixelIndex + channel]);
      }
      
      callback(x, y, color);
    }
  }
}