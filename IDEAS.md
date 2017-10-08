# Tech

- Ajv
- Axios
- Ramda

# Goals

- Create a simple interface for creating Hypermedia-based API resources based on JSON Hyper-Schema definitions
- Work both on the front-end and back-end

# Domain

- Root
- Schema
- LDO
- Instance
  - (Perhaps all of this should just be handled by `hyper-glue` / `gooey`)
  - Entity and Collection
    * One vs. All
  - Internal and External
    * Internal = local object / state
    * External = async remote object / state
  - Normalized vs. denormalized state values (probably the same as internal and external)
    * Sync vs. Async
    * Allow normalized references to be lazy (called once, cached thenafter)
    * Perhaps this can/should be handled in `hyper-glue` (gooey + hyper-mesh)

# Features

- Automatically validate requests and responses based on their associated JSON Schema
- Automatically follows and caches normalized references whenever appropriate
- Support paginated responses (`next` rel type)

# Interface

- `Resoource`
 * this
  - `ref`
  - `schema`
  - `config`
 * `get`
 * `post`
 * `put`
 * `patch`
 * `delete`
 * `follow`
  - constructs and follows an LDO present on the schema by `rel`
  - validates the request body pre-flight against the relevant JSON Schema
 * `form`
  - constructs an empty representation of the schema to allow for simple HTML form integrations
 * `paginate`
  - provides an async generator for allowing pagination on LDOs
