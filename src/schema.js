import { HyperCore } from './core'
import { HyperLink } from './link'

export class HyperSchema {

  constructor (schema, core) {
    this.schema = schema
    this.core   = core
  }

  get key () {
    // TODO: normalized unique identifier of the schema
  }

  validate (entity, ...args) {
    return this.core.api.getSchema(this.key, ...args)
  }

  create (entity) {
    // creates a new entity matched against a schema
  }

  links () {
    return this.data.links.map(link => new HyperLink(link))
  }

  linkBy (matcher) {
    // return find(this.links(), matcher)
  }

  // hasRef (ref) {

  // }

  // hasId (id) {

  // }

  // has (key) {
  //   return this.hasRef(key) || this.hasId(key)
  // }

  static ify (instance) {
    // TODO: apply schema and parse entity/links of provided instance
  }

  static empty (schema) {
    // TODO: just map to `this.core.empty`
  }

  static denormalize (schema, id) {
    // TODO: just map to `this.core.denormalize`
  }

}
