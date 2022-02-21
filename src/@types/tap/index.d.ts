export function test(
  description: string,
  testFn: (childTest: Tap) => void | Promise<void>
): string;

export default interface Tap {
  same(actual: unknown, expected: unknown): void;
  throws(fn: () => void, expectedError: any): void;
  end(): void;
  test: typeof test;
}
