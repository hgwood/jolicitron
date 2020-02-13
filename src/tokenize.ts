export const tokenize = (input: string) => {
  return input.split(/\s+/).filter(Boolean);
};
