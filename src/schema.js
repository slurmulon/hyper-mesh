import { HyperCore } from './core'
import { HyperEntity } from './entity'
import { HyperLink } from './link'
import { HyperResource } from './resource'
import { find } from 'lodash'

export class HyperSchema {

  constructor (schema, core) {
    this.schema = schema
    this.core   = core
  }

  get key () {
    // TODO: normalized unique identifier of the schema (probably just `$id`)
  }

  get api () {
    return new HyperResource(this.schema)
  }

  validate (entity, ...args) {
    return this.core.api.getSchema(this.key, ...args)
  }

  // TODO: consider `entity` vs `collection`
  create (entity) {
    return new HyperEntity(entity, this.schema)
  }

  links () {
    return this.schema.links.map(link => new HyperLink(link))
  }

  linkBy (matcher) {
    return find(this.links(), matcher)
  }

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
