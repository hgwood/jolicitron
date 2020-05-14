export function tokenize(input: string): Iterator<string> {
  const matches = input.matchAll(/[^ \n\r]+/g);
  return {
    next() {
      const { done, value } = matches.next();
      return {
        done,
        value: value[0],
      };
    },
  };
}
