/**
 * @returns true iff n (int) is in [a,b)
 */
export default function bounded(n: number, a: number, b: number) {
  return n >= a && n < b;
}
