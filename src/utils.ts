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

/**
 * Casts a value to an enumerator.
 *
 * @param enumerator - The enumerator the value belongs to.
 * @param value - The value to cast.
 * @returns The enumerator value equivalent of the cast value, or undefined if couldn't cast value.
 */
export function valueToEnum<
	EnumType extends Record<string, unknown>,
	EnumValue = EnumType extends Record<string, infer V> ? V : never,
>(enumerator: EnumType, value: EnumValue): EnumValue | undefined {
	return (Object.values(enumerator) as unknown as EnumValue[]).includes(value)
		? (value as unknown as EnumValue)
		: undefined;
}
