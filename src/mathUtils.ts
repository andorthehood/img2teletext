export const sum = function(...values: number[]): number {
	return values.reduce(function(accumulator: number, current: number): number {
		return accumulator + current;
	});
};

export const avg = function(...values: number[]): number {
	return sum(...values) / values.length;
}; 