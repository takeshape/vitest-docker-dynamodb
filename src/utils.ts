export const isFunction = <F>(f: unknown | (() => F)): f is () => F =>
  !!f && typeof f === 'function';

const convertToNumbers = (
  keys: Array<string | number | symbol>,
  value: string | number
): number | string => {
  if (!Number.isNaN(Number(value)) && keys.some((v) => v === Number(value))) {
    return Number(value);
  }

  return value;
};

// credit: https://stackoverflow.com/a/62362002/1741602
export const omit = <T extends object, K extends [...(keyof T)[]]>(
  obj: T,
  ...keys: K
): { [P in Exclude<keyof T, K[number]>]: T[P] } => {
  return (
    (Object.getOwnPropertySymbols(obj) as Array<keyof T>)
      .concat(
        Object.keys(obj).map((key) => convertToNumbers(keys, key)) as Array<
          keyof T
        >
      )
      .filter((key) => !keys.includes(key))
      // biome-ignore lint/performance/noAccumulatingSpread: performance not a huge concern here
      .reduce((agg, key) => ({ ...agg, [key]: obj[key] }), {}) as {
      [P in Exclude<keyof T, K[number]>]: T[P];
    }
  );
};

export function randomId() {
  return Math.random().toString(36).slice(-5);
}
