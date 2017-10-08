# Core

- Support all official `rel` types
- Support JSON profiles (http://json-schema.org/latest/json-schema-core.html#profile)
- "A schema MAY (and likely will) have multiple URIs, but there is no way for a URI to identify more than one schema. When multiple schemas try to identify with the same URI, validators SHOULD raise an error condition."
- Integrate `rollup` to reduce the weight of `lodash`
