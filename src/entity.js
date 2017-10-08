import { HyperLink } from './link'

export class HyperEntity {

  constructor (instance, schema) {
    this.instance = instance
    this.schema = schema
  }

  use (schema) {
    this.schema = schema

    return this
  }

  validate () {
    return this.schema.validate(this.instance)
  }

  // TODO: probably just want to map these to
  // this.schema.links and this.schema.linksBy
  links () {
    // return this.schema.links.map(link => new HyperLink(link))
    return this.schema.links()
  }

  linksBy (matcher) {
    // return find(this.links(), matcher)
    return this.schema.linksBy(matcher)
  }

}
