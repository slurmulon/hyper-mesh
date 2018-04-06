import { HyperSchema } from './schema'
import { HyperResource } from './resource'

import Ajv from 'ajv'
import pointer from 'json-pointer'
import { get, find, map, isEmpty } from 'lodash'

/**
 * Centerpiece of the hyper-mesh architecture. Establishes a root/index schema
 * and is used as the base-point for all internal references.
 *
 * Also handles integration with Ajv, the core JSON Schema validation module.
 */
// TODO: asynchronous compilation (@see https://github.com/epoberezkin/ajv#asynchronous-schema-compilation)
// TODO: accept custom `axios` instance (optional)
// TODO: potentailly rename to HyperIndex (renaming `this.core` to `this.index` as well)
export class HyperApi {

  /**
   * @param {Object|string} root base/index JSON Hyper-Schema definition
   */
  // TODO: if `config` is a string call `fetch` for the schemas
  // TODO: accept baseURL parameter. could also imply from root.json URL.
  // TODO: make root optional. not necessary just a solid practice.
  // constructor (root, config) {
    // this.root = root
  constructor (config) {
    this.core = new Ajv({ v5: true, jsonPointers: true, allErrors: true, ...config })
  }

  // TODO: `fetch`
  // calls a remote schema API and fetches the index of schemas

  /**
   * Provides every indexed JSON Hyper-Schema
   *
   * @returns {Array<HyperSchema>}
   */
  // TODO: consider binding helper functions for searching for schemas
  get schemas () {
    return map(this.core._schemas, schema => new HyperSchema(schema.schema, this))
  }

  /**
   * Provides HTTP resource versions of every indexed JSON Hyper-Schema
   *
   * @returns {Array<HyperResource>}
   */
  // TODO: might want to map these by $id so destructuring/lookup is trivial
  get resources () {
    return this.schemas.map(schema => new HyperResource(schema))
  }

  /**
   * Determines the number of indexed JSON Hyper-Schemas (and thus resources)
   *
   * @returns {Number}
   */
  get count () {
    return Object.keys(this.schemas).length
  }

  /**
   * Finds a previously indexed JSON Hyper-Schema that matches the resolver function
   *
   * @param {Function} resolver
   * @returns {Array<HyperSchema>}
   */
  schema (resolver) {
    return this.schemas.find(resolver)
  }

  /**
   * Finds an HTTP resource associated with a previously indexed JSON Hyper-Schema
   * that matches the resolver function
   *
   * @param {Function} resolver
   * @returns {Array<HyperResource>}
   */
  resource (resolver) {
    return this.resources.find(resolver)
  }

  // TODO:
  // load (url)

  /**
   * Loads the root JSON Schema and populates this central storage entity
   * with all of the JSON Schemas and their references.
   *
   * @see: http://json-schema.org/latest/json-schema-core.html#id-keyword
   *
   * @param {Function} [resolvers] mapping functions to determine keys and schemas {key: String, schema: Object}
   * @returns {Promise<this>}
   */
  // TODO: accept root schema URL (probably makes the `fetch` method redundant)
  // TODO:
  // - report any `errors` or `missing` schemas during index population
  // - create HyperSchema from each of the `definitions`...?
  // TODO: make default resolvers (use `ajv`)
  // TODO: support either `this.all` or `this.root.definitions`
  async index (resolvers = { }) {
    this.prepare()

    const root = await this.resolve(this.root)

    root.definitions.forEach(async def => {
      const schema = resolvers.schema instanceof Function ? await resolvers.schema(def) : def
      const key    = resolvers.key    instanceof Function ? await resolvers.key(def)    : def.$ref

      if (!schema || !key) {
        throw new Error('Failed to index API. Schema or key could not be resolved from definition', def)
      }

      this.add(schema, key)
    })

    return this
  }

  /**
   * Prepares the API for use by preemptively loading all of the JSON Meta-Schema dependencies
   *
   * @param {Array<string>} [metas] additional JSON Meta-Schemas to prepare
   * @returns {this}
   */
  // TODO: could also dig into every schema and look for `$schema` URIs. automatically follow.
  prepare (metas = []) {
    const schemas = [
      require('json-schema/draft-04/hyper-schema'),
      require('json-schema/draft-04/links')
    ].concat(metas)

    schemas.forEach(schema => this.core.addMetaSchema(schema, schema.id, true))

    return this
  }

  /**
   * Adds/indexes a new JSON Schema and associates it with the provided key ($id)
   *
   * @param {Object} schema full JSON Schema
   * @param {string} key value to use as identifier/lookup for the JSON Schema
   * @param {boolean} [meta] whether or not the schema is a Meta-Schema
   * @returns {this}
   */
  // TODO: try to get this `key` into `HyperSchema`
  // TODO: probably want to track the parsed HyperSchemas as well
  add (schema, key, meta = false) {
    const valid      = meta || this.core.validateSchema(schema, 'log')
    const identifier = key  || schema || schema.id || schema.$id

    if (valid) {
      this.core.addMetaSchema(schema, identifier)
    } else {
      // TODO; warn about being an invalid identifier
    }

    return this
  }

  /**
   * Removes a previously indexed JSON Schema matching the provided key ($id)
   *
   * @param {string} id
   * @returns {this}
   */
  remove (key) {
    this.core.removeSchema(key)

    return this
  }

  /**
   * Finds an indexed JSON Schema matching the provided $id or $ref
   *
   * @param {string} key
   * @returns {Object}
   */
  // TODO: allow return of either `schema` or `resource`
  get (key) {
    return this.byRef(key) || this.byId(key)
  }

  /**
   * Finds an indexed JSON Schema matching the provided $ref
   *
   * @param {string} ref
   * @returns {Object}
   */
  // TODO: allow return of either `schema` or `resource`
  byRef (ref) {
    return this.schemas[ref]
  }

  /**
   * Finds an indexed JSON Schema matching the provided $id
   *
   * @param {string} id
   * @returns {Object}
   */
  // TODO: allow return of either `schema` or `resource`
  byId ($id) {
    return find(this.schemas, { $id })
  }

  /**
   * Determines if a JSON Schema has been indexed against the provided $ref
   *
   * @param {string} ref
   * @returns {boolean}
   */
  hasRef (ref) {
    return !isEmpty(this.byRef(ref))
  }

  /**
   * Determines if a JSON Schema has been indexed against the provided $id
   *
   * @param {string} id
   * @returns {boolean}
   */
  hasId (id) {
    return !isEmpty(this.byId(id))
  }

  /**
   * Determines if a JSON Schema has been indexed using the provided $id or $ref
   *
   * @param {string} key
   * @returns {boolean}
   */
  has (key) {
    return this.hasRef(key) || this.hasId(key)
  }

  // @see http://json-schema.org/latest/json-schema-core.html#rfc.section.8
  /**
   * Finds a JSON Schema matching a JSON Pointer path
   *
   * @param {string} pointer JSON Pointer path
   * @returns {Object} matching JSON Schema
   */
  // TODO: try to eliminate the need fo this. Ajv should handle everything.
  find (path = '#') {
    const chunks = path.split('/')
    const root   = path.startsWith('#') ? `#/${chunks[1]}` : path
    const base   = this.get(root)

    if (base && chunks.length > 1) {
      const subChunks  = chunks.splice(2, chunks.length)
      const subPointer = subChunks.length ? subChunks.map(chunk => `/${chunk}`).reduce((sum, next) => sum + next) : ''

      return pointer.get(base, subPointer)
    }

    return base
  }

  /**
   * Finds the JSON Schema matching a JSON Pointer path and provides a validator
   *
   * Defaults to the root schema validator should it exist (#/)
   *
   * @param {string} pointer JSON Pointer path
   * @returns {Function|null} validator for matching JSON Schema
   */
  matching (pointer) {
    const match = this.find(pointer)

    if (!match) {
      return this.core.compile(match)
    }

    return null
  }

  /**
   * Creates a validation function based on the JSON Hyper-Schema (found with `id`)
   *
   * @see https://github.com/epoberezkin/ajv#combining-schemas-with-ref
   *
   * @param {string} id identifier of the JSON Huper-Schema (usually $id)
   * @param {...*} [args] additional arguments to pass to Ajv
   * @returns {Function}
   */
  validator (id, ...args) {
    return this.core.getSchema(id, ...args)
  }

  /**
   * Returns a denormalized version of a JSON Schema
   * 
   * Traverses any sub-schemas and then replaces the "$ref"
   * properties with their full dereferenced schema
   *
   * @param {Object} schema JSON Schema object to denormalize
   * @returns {Object} denormalized instance JSON Schema
   */
  denormalize (schema) {
    if (schema instanceof Object) {
      if (!schema.properties) {
        return schema
      }

      Object.keys(schema.properties).forEach(propName => {
        if (schema.properties.hasOwnProperty(propName)) {
          const property = schema.properties[propName]

          Object.keys(property).forEach(key => {
            if (property.hasOwnProperty(key) && key === '$ref') {
              const derefed = this.get(property[key])

              schema.properties[propName] = derefed ? this.denormalize(derefed) : property
            }
          })
        }
      })

      return schema
    }

    if (schema && schema.constructor === String) {
      const derefed = this.get(schema)

      return this.denormalize(derefed)
    }

    throw new Error('Failed to denormalize malformed JSON Schema, must be an Object')
  }

  /**

   * Resolves a JSON Hyper-Schema by a URI
   *
   * If a local Object, it simply returns the result
   * If a remote URL, it follows the URL and then returns the body
   * 
   *  - WARN: shouldn't resolve $id by URI per http://json-schema.org/latest/json-schema-core.html#rfc.section.8
   *
   *    "The URI is not a network locator, only an identifier.
   *     A schema need not be downloadable from the address if it is a network-addressable URL,
   *     and implementations SHOULD NOT assume they should perform a network operation when
   *     they encounter a network-addressable URI."
   *
   * @param {string|Object} data unique identifier or full representation of a JSON Hyper-Schema
   * @return {Promise<Object>} resolved content of JSON Hyper-Schema
   */
  async resolve (data) {
    if (typeof data === 'string') {
      const local = this.get(data)

      if (!local) {
        return await axios.get(data)
      }

      return local
    }

    if (typeof data === 'object') {
      return data
    }

    return null
  }

}
