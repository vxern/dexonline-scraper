/**
 * Taking two arrays, combines them so that opposing elements come in pairs.
 *
 * @param arrays - The arrays to zip.
 * @returns An array of tuples of opposing elements.
 */
function zip<T>(...arrays: Array<Array<T>> & { length: 2 }): Array<[T, T]> {
	// Takes the minimum of the two arrays to prevent out-of-bounds access.
	const length = Math.min(...arrays.map((array) => array.length));

	return Array.from(new Array(length)).map((_, index) => [arrays[0]![index]!, arrays[1]![index]!]);
}

/**
 * Casts a value to an enumerator.
 *
 * @param enumerator - The enumerator the value belongs to.
 * @param value - The value to cast.
 * @returns The enumerator value equivalent of the cast value, or undefined if couldn't cast value.
 */
function valueToEnum<
	EnumType extends Record<string, unknown>,
	EnumValue = EnumType extends Record<string, infer V> ? V : never,
>(enumerator: EnumType, value: EnumValue): EnumValue | undefined {
	return (Object.values(enumerator) as unknown as Array<EnumValue>).includes(value)
		? (value as unknown as EnumValue)
		: undefined;
}

export { valueToEnum, zip };
