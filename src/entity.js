import { HyperLink } from './link'

export class HyperEntity {

  constructor (instance, schema) {
    this.instance = instance
    this.schema   = schema
  }

  use (schema) {
    return Object.assign(this, { schema })
  }

  validate () {
    return this.schema.validate(this.instance)
  }

  links () {
    return this.schema.links()
  }

  linksBy (matcher) {
    return this.schema.linksBy(matcher)
  }

}
