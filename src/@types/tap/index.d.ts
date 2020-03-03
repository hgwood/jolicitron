export function test(
  description: string,
  testFn: (childTest: Tap) => void | Promise<void>
): string;

export default interface Tap {
  deepEqual(actual: unknown, expected: unknown): void;
  end(): void;
}
