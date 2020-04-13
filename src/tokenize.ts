export function* tokenize(input: string) {
  for (const [token] of input.matchAll(/\S+/g)) {
    yield token;
  }
}
