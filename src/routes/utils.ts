type Color = [number, number, number];

export const generateColorsInRange = (
	count: number,
	lowerBound: Color = [0, 0, 0],
	upperBound: Color = [1, 1, 1]
) => {
	const tuples = [];
	const steps = lowerBound.map((lb, index) => (upperBound[index] - lb) / Math.cbrt(count - 1));

	for (let x = lowerBound[0]; x <= upperBound[0]; x += steps[0]) {
		for (let y = lowerBound[1]; y <= upperBound[1]; y += steps[1]) {
			for (let z = lowerBound[2]; z <= upperBound[2]; z += steps[2]) {
				if (tuples.length < count) {
					tuples.push([x, y, z]);
				} else {
					return tuples;
				}
			}
		}
	}
	return tuples;
};

export const generateTuples = (upper1: number, upper2: number): [number, number][] => {
	const tuples: [number, number][] = [];
	for (let i = 0; i <= upper1; i++) {
		for (let j = 0; j <= upper2; j++) {
			tuples.push([i, j]);
		}
	}
	return tuples;
};
