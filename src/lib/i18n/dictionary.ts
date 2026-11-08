import type { en } from "./en";

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

// Every language must provide exactly the keys of English.
export type Dictionary = Widen<typeof en>;
