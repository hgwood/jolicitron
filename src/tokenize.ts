export function tokenize(input: string): Iterable<string> {
  return {
    [Symbol.iterator]() {
      const matches = input.matchAll(/\S+/g);
      return {
        next() {
          const { done, value } = matches.next();
          return {
            done: done,
            value: value[0]
          };
        }
      };
    }
  };
}
