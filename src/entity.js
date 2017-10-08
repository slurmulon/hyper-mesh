import { HyperLink } from './link'

/**
 * Entity instance belonging to a single JSON Hyper-Schema
 */
export class HyperEntity {

  /**
   * @param {*} instance
   * @param {HyperSchema} schema
   */
  constructor (instance, schema) {
    this.instance = instance
    this.schema   = schema
  }

  /**
   * Creates a new entity instance using a different JSON Hyper-Schema
   *
   * @param {HyperSchema} schema
   * @returns {HyperEntity}
   */
  use (schema) {
    return Object.assign(this, { schema })
  }

  /**
   * Validates the entity instance against its JSON Hyper-Schema
   *
   * @returns {boolean}
   */
  validate () {
    return this.schema.validate(this.instance)
  }

  /**
   * Provides the LDOs (Link Description Objects) belonging
   * to the parent JSON Hyper-Schema
   *
   * @returns {Array<HyperLink>}
   */
  links () {
    return this.schema.links()
  }

  /**
   * Provides the LDOs (Link Description Objects) belonging
   * to the parent JSON Hyper-Schema and matching the provided
   * JSON Pointer.
   *
   * @param {string} matcher JSON Pointer
   * @returns {Array<HyperLink>}
   */
  linksBy (matcher) {
    return this.schema.linksBy(matcher)
  }

}
