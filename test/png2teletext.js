const img2teletext = require('../dist/index').default;
const fs = require('fs');
const PNG = require('pngjs').PNG;

describe('img2teletext', () => {
	it('should return with the correct teletext data', () => {
		const data = fs.readFileSync('./test/test.png');
		const png = PNG.sync.read(data);
		const teletext = img2teletext(png.data, png.width);

		// Convert Uint8Array to regular array for Jest snapshot
		expect(Array.from(teletext)).toMatchSnapshot();
	});
});
