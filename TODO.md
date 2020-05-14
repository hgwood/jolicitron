# Pre-checking

Separate checking types (see validate.ts) and checking semantics.
Type-checking is making TypeScript happy from an unknown.
Semantic-checking is on top of types, like:
- properties of objects are unique => could be typed with a Map but maybe we want a warning, not an error
- length of arrays refer to a known variable => could be typed? I don't think so, and we definitely want an error for that
- no shadowing or overriding of variables => could be typed? but maybe we want a warning, not an error

Maybe
- type-check
- consistency-check
- scope-check

Error: parser will definitely crash at run time
Warning: parser will definitely not crash at runtime, but result might be unexpected

# Length type

We might want to introduce a "length" type that indicates that the value is a lenght for a future array.
Useful for 2 reasons:
- we can check that lengths are positive safe integers when we read them instead of when we use them
- lengths are the only values that we save as vars, instead of saving all numbers
But: can't use shortcuts for numbers

Maybe instead the compiler can infer what values are used as lengths. Sounds good.

# Use Map for vars

Using `new Map(parentVars)` looks like a relevant replacement of `Object.create(parentVar)` as data is not copied.

# FIXME

look for FIXMEs in the code
