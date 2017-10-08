import { HyperApi } from './api'
import { HyperEntity } from './entity'
import { HyperLink } from './link'
import { HyperResource } from './resource'
import { find } from 'lodash'

export class HyperSchema {

  constructor (schema, api) {
    this.schema = schema
    this.api = api
  }

  get id () {
    // TODO: normalized unique identifier of the schema (probably just `$id`)
  }

  get api () {
    return new HyperResource(this.schema)
  }

  // TODO: push this logic into HyperApi
  validate (entity, ...args) {
    return this.api.core.getSchema(this.key, ...args)
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
