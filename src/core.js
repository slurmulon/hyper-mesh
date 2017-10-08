import Ajv from 'ajv'

export class HyperCore {

  constructor (root) {
    this.root = root
    this.api  = new Ajv({ v5: true, jsonPointers: true, allErrors: true })
  }

  /**
   * Loads the root schema and populates this core storage entity
   * with all of the schemas and their references
   */
  index () {
    // 1. rollow root schema
    //  - determine if it's a URL (string), object, etc.
    // 2. for each schema call `this.add`
    // 3. call `prepare` to load the dependent meta schemas
    // 4. report any `errors` or `missing` schemas during index population

    return this
  }

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

  }

  matching (pointer) {

  }

  get all () {
    return this.api._schemas
  }

  get count () {
    return Object.keys(this.all).length
  }

  byRef (ref) {

  }

  byId (id) {

  }

  hasRef (ref) {

  }

  hasId (id) {

  }

  has (key) {

  }

  denormalize (schema, id) {

  }

}
