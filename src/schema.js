import { HyperApi } from './api'
import { HyperEntity } from './entity'
import { HyperLink } from './link'
import { HyperResource } from './resource'
import { find } from 'lodash'
import empty from 'empty-schema'

/**
 * A single JSON Hyper-Schema document
 */
export class HyperSchema {

  /**
   * @param {Object} schema JSON Hyper-Schema
   * @param {HyperApi} api core/index schema store
   */
  constructor (schema, api) {
    this.schema = schema
    this.api = api
  }

  /**
   * Provides a normalized unique identifier for the JSON Hyper-Schema
   *
   * @returns {string}
   */
  get id () {
    // TODO: normalized unique identifier of the schema (probably just `$id`)
  }

  /**
   * Provides a Restful API HTTP resource based on the JSON Hyper-Schema's links
   *
   * @returns {HyperResource}
   */
  get resource () {
    return new HyperResource(this.schema)
  }

  /**
   * Validates an arbitrary entity against the JSON Hyper-Schema
   *
   * @param {*} entity
   * @param {...*} [args] additional arguments to pass to Ajv
   * @returns {boolean}
   */
  validate (entity, ...args) {
    return this.validator.call(this, entity)
  }

  /**
   * Creates a validation function based on the JSON Hyper-Schema
   *
   * @param {...*} [args] additional arguments to pass to Ajv
   * @returns {Function}
   */
  // TODO: push this logic into HyperApi
  validator (...args) {
    return this.api.core.getSchema(this.id, ...args)
  }

  /**
   * Creates a new entity instance and associates it with
   * the JSON Hyper-Schema
   *
   * @param {*} entity
   * @returns {HyperEntity}
   */
  // TODO: consider `entity` vs `collection`
  create (entity) {
    return new HyperEntity(entity, this.schema)
  }

  /**
   * Provides all of the LDOs belonging to the JSON Hyper-Schema
   *
   * @returns {Array<HyperLink>}
   */
  links () {
    return this.schema.links.map(link => new HyperLink(link))
  }

  /**
   * Provides the LDOs belonging to the JSON Hyper-Schema which
   * match the provided POJO
   *
   * @param {Object} matcher
   * @returns {Array<HyperLink>}
   */
  linkBy (matcher) {
    return find(this.links(), matcher)
  }

  /**
   * Generates an empty template Object based on the JSON Hyper-Schema.
   *
   * @returns {Object} empty placeholder/template object
   */
  template () {
    return empty(this.schema)
  }

  /**
   * Parses an arbitrary Object against the JSON Hyper-Schema.
   *
   * Automatically creates HyperEntity and HyperLink instances
   * based on the contents of the Object.
   *
   * @param {Object} instance
   * @returns {HyperEntity}
   */
  ify (instance) {
    // TODO: apply schema and parse entity/links of provided instance
  }

  /**
   * Creates an empty/placeholder Object that adheres to the JSON Hyper-Schema
   *
   * @returns {Object}
   */
  empty () {
    // TODO: just map to `this.core.empty`
  }

  /**
   * Denormalizes the JSON Hyper-Schema.
   *
   * Replaces any sub-schema $refs with their full representations.
   *
   * @returns {HyperSchema}
   */
  denormalize () {
    // TODO: just map to `this.core.denormalize`
  }

}
