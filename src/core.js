import { HyperSchema } from './schema'
import { HyperResource } from './resource'

import Ajv from 'ajv'
import pointer from 'json-pointer'
import { get, find, map, isEmpty } from 'lodash'

// TODO: potentailly rename to HyperApi (renaming `this.api` to `this.core` as well)
export class HyperCore {

  constructor (root) {
    this.root = root
    this.api  = new Ajv({ v5: true, jsonPointers: true, allErrors: true })

    // TODO: determine if we should call this here
    // this.index()
  }

  /**
   * Loads the root schema and populates this core storage entity
   * with all of the schemas and their references
   */
  // @see: http://json-schema.org/latest/json-schema-core.html#id-keyword
  index () {
    // 0. call this.prepare (load meta schemas)
    // 1. follow root schema
    //  - determine if it's a URL (string), object, etc.
    //  - use $id as the base URI
    // 2. for each schema call `this.add` using the base URI provided by `$id`
    // 3. call `prepare` to load the dependent meta schemas
    // 4. report any `errors` or `missing` schemas during index population
    // ??? - create HyperSchema from each of the `definitions`...?

    return this
  }

  // Prepares the API for use by pre-emptively loading all of the JSON Meta-Schema dependencies
  // TODO: could also dig into every schema and look for `$schema` URIs. automatically follow.
  prepare (metas = []) {
    const schemas = [
      require('json-schema/draft-04/hyper-schema'),
      require('json-schema/draft-04/links')
    ].concat(metas)

    schemas.forEach(schema => this.api.addMetaSchema(schema, schema.id, true))

    return this
  }

  add (schema, key, isMeta) {
    const valid = isMeta || this.api.validateSchema(schema, 'log')
    const identifier = key || schema || schema.id

    if (valid) {
      this.api.addMetaSchema(schema, identifier)
    } else {
      // TODO; warn about being an invalid identifier
    }

    return this
  }

  remove (key) {
    this.api.removeSchema(key)

    return this
  }

  get (key) {
    return this.byRef(key) || this.byId(key)
  }

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
      return this.api.compile(match)
    }

    return null
  }

  get all () {
    return map(this.api._schemas, schema => new HyperSchema(schema, this))
  }

  get count () {
    return Object.keys(this.all).length
  }

  get resources () {
    return this.all.map(schema => new HyperResource(schema))
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
  }

}
