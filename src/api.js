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
// TODO: potentailly rename to HyperApi (renaming `this.core` to `this.core` as well)
export class HyperApi {

  constructor (root) {
    this.root = root
    this.core = new Ajv({ v5: true, jsonPointers: true, allErrors: true })

    // TODO: determine if we should call this here. probably.
    // this.index()
  }

  // TODO: consider binding helper functions for searching for schemas
  get schemas () {
    return map(this.core._schemas, schema => new HyperSchema(schema, this))
  }

  // TODO: might want to map these by $id so destructuring/lookup is trivial
  get resources () {
    return this.all.map(schema => new HyperResource(schema))
  }

  get count () {
    return Object.keys(this.schemas).length
  }

  /**
   * Loads the root schema and populates this core storage entity
   * with all of the schemas and their references
   */
  // @see: http://json-schema.org/latest/json-schema-core.html#id-keyword
  async index () {
    // 0. call this.prepare (load meta schemas)
    // 1. follow root schema
    //  - determine if it's a URL (string), object, etc.
    //  - use $id as the base URI
    // 2. for each schema call `this.add` using the base URI provided by `$id`
    // 3. call `prepare` to load the dependent meta schemas
    // 4. report any `errors` or `missing` schemas during index population
    // ??? - create HyperSchema from each of the `definitions`...?
    this.prepare()

    const root = this.root

    

    return this
  }

  // Prepares the API for use by pre-emptively loading all of the JSON Meta-Schema dependencies
  // TODO: could also dig into every schema and look for `$schema` URIs. automatically follow.
  prepare (metas = []) {
    const schemas = [
      require('json-schema/draft-04/hyper-schema'),
      require('json-schema/draft-04/links')
    ].concat(metas)

    schemas.forEach(schema => this.core.addMetaSchema(schema, schema.id, true))

    return this
  }

  // TODO: try to get this `key` into `HyperSchema`
  add (schema, key, meta = false) {
    const valid      = meta || this.core.validateSchema(schema, 'log')
    const identifier = key  || schema || schema.id

    if (valid) {
      this.core.addMetaSchema(schema, identifier)
    } else {
      // TODO; warn about being an invalid identifier
    }

    return this
  }

  remove (key) {
    this.core.removeSchema(key)

    return this
  }

  get (key) {
    return this.byRef(key) || this.byId(key)
  }

  byRef (ref) {
    return get(this.all[ref], 'schema')
  }

  byId (id) {
    return get(find(this.all), { id }, 'schema')
  }

  hasRef (ref) {
    return !isEmpty(this.byRef(ref))
  }

  hasId (id) {
    return !isEmpty(this.byId(id))
  }

  has (key) {
    return this.hasRef(key) || this.hasId(key)
  }

  // @see http://json-schema.org/latest/json-schema-core.html#rfc.section.8
  find (path = '#') {
    const chunks = path.split('/')
    const root   = path.startsWith('#') ? `#/${chunks[1]}` : path
    const base   = this.get(root)

    if (base && chunks.length > 1) {
      const subChunks  = chunks.splice(2, chunks.length)
      const subPointer = subChunks.length ? subChunks.map(chunk => `/${chunk}`).reduce((a,b) => a + b) : ''

      return pointer.get(base, subPointer)
    }

    return base
  }

  matching (pointer) {
    const match = this.find(pointer)

    if (!match) {
      return this.core.compile(match)
    }

    return null
  }

  /**
   * Returns a de-normalized (i.e. flattened) version of a JSON Schema
   * 
   * In other words, this traverses any sub-schemas (should they
   * exist) and then replaces the associated "$ref" properties 
   * with their full dereferenced schema
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

    throw new Error('Failed to denormalize malformed schema, must be an Object')
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
   *     and implementations SHOULD NOT assume they should perform a network operation when they encounter a network-addressable URI."
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
