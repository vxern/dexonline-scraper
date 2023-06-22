/**
 * Taking two arrays, combines them so that opposing elements come in pairs.
 *
 * @returns An array of tuples of opposing elements.
 */
export function zip<T, L extends number>(a: T[] & { length: L }, b: T[] & { length: L }): [T, T][] {
	const result: [T, T][] = [];
	for (const index of Array(Math.min(a.length, b.length)).keys() as IterableIterator<number & L>) {
		result.push([a[index], b[index]]);
	}
	return result;
}
