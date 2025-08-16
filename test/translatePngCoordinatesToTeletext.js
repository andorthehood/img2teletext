const { translateImageCoordinatesToTeletext } = require('../dist/index');

describe('translateImageCoordinatesToTeletext', () => {
	it('should return an array', () => {
		expect(Array.isArray(translateImageCoordinatesToTeletext(10, 10))).toBe(true);
	});

	it('(2, 3) => [1, 1]', () => {
		expect(translateImageCoordinatesToTeletext(2, 3)).toEqual([1, 1]);
	});
});
