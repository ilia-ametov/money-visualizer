export type PartialUnknown<T> = {
	[P in keyof T]?: (T[P] extends ReadonlyArray<infer Item> ? ReadonlyArray<unknown> : unknown);
};