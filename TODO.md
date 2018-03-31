# Core

- Fully support all JSON Hyper-Schema features
- Support all official `rel` types
- Support JSON profiles (http://json-schema.org/latest/json-schema-core.html#profile)
- "A schema MAY (and likely will) have multiple URIs, but there is no way for a URI to identify more than one schema. When multiple schemas try to identify with the same URI, validators SHOULD raise an error condition."
- Support $merge and $patch keywords (https://github.com/epoberezkin/ajv#merge-and-patch-keywords)
- Integrate asynchronous schema validation in Ajv: https://github.com/epoberezkin/ajv#asynchronous-schema-compilation
- Integrate `rollup` to reduce the weight of `lodash`
