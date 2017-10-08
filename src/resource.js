import axios from 'axios'
import empty from 'empty-schema'

/**
 * Unifies a JSON Hyper-Schema document with Axios.
 *
 * Provides a pragmatic interface for interacting with a JSON Hyper-Schema based Restful HTTP API.
 */
export class HyperResource {

  constructor (schema, http) {
    this.schema = schema
    this.http   = http
  }

  get api () {
    return axios(this.http)
  }

  use (http) {
    return new HyperResource({ ...this, ...http })
  }

  /**
   * Provides the Link Description Object matching a rel
   *
   * @param {string} rel the unique relation of the link
   * @returns {Promise<HyperLink>} Link Description Object matching rel
   */
  async link (rel) {
    return this.schema.linkBy({ rel })
  }

  /**
   * Determines the URL of a Link Description Object by cross-referencing
   * the instance object with the relevant JSON Hyper-Schema
   *
   * @param {string} rel the unique relation of the link
   * @param {Object} [instance] object to use as the resource entity instance
   * @returns {Promise<String>} URL of the Link Description Object
   */
  async url (rel, instance) {
    const link = await this.link(rel)

    return link.url(instance)
  }

  /**
   * Generates a unique Restangular-based resource based on the
   * determined URL of the Link Description Object
   *
   * @param {string} rel the unique relation of the link
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {boolean} [collection] whether or not the resource represents a collection
   * @returns {Promise<Restangular>} Restangular resource
   */
  // TODO: suse HyperLink.prototype.follow instead
  async resource (rel, instance, collection = false) {
    const url = await this.url(rel, instance)

    // TODO: support all/one (i.e. `collection`)
    return this.api.create({ baseUrl: url })
  }

  /**
   * Generates a unique Axios-based resource from an LDO (based on rel)
   * and then automatically performs an HTTP operation based on its "method".
   *
   * If no method is provided, the method defined on the source LDO
   * will be implied (suggested usage as it's Hypermedia-friendly)
   *
   * @param {string} rel the unique relation of the link
   * @param {string} [method] HTTP method to perform (lower-case)
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to resource HTTP action
   * @param {Promise} resource action response
   */
   // TODO: add header based on encType if it exists
   // TODO: automatically validate data against entity.schema
   // TODO: accept headers
  async action ({ rel, method, instance }, ...args) {
    const link     = await this.link(rel)
    const resource = await this.resource(rel, instance)

    const action = method || link.method.toLowerCase()
    const call   = resource[action]

    if (call instanceof Function) {
      return call(...args)
    } else {
      // TODO: warn about unsupported action
    }

    return null
  }

  /**
   * Performs a GET request on the Restful API resource
   * and returns a single JSON object
   *
   * "The object represents a resource and the instance object
   * is treated as a full representation of the target resource
   * identified by the specified URI"
   *
   * @param {string} [rel] the unique relation of the link
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  get (rel = 'self', instance, ...args) {
    return this.action({ rel, method: 'get', instance }, ...args)
  }

  /**
   * Performs a GET request on the Restful API resource
   * and returns a full representation JSON object
   *
   * "The target of the link is the full representation for the instance object"
   *
   * @param {...*} [arguments] additional arguments to provide to request method
   * @returns {Promise} response
   */
  full () {
    return this.get('full', ...arguments)
  }

  /**
   * Performs a GET request on the Restful API resource
   * and returns a schema describing instance JSON object
   *
   * "The target of the link is a schema describing the instance object.
   *  This MAY be used to specifically denote the schemas of objects
   *  within a JSON object hierarchy, facilitating polymorphic type data structures"
   *
   * @param {...*} [arguments] additional arguments to provide to request method
   * @returns {Promise} response
   */
  schema () {
    return this.get('describedBy', ...arguments)
  }

  /**
   * Performs a GET request on the Restful API resource
   * and returns a JSON object that should be used as the
   * root entity concerning user agent interactions
   *
   * "This relation indicates that the target of the link
   *  SHOULD be treated as the root or the body of the
   *  representation for the purposes of user agent interaction
   *  or fragment resolution. All other data in the document
   *  can be regarded as meta-data for the document. The
   *  URI of this link MUST refer to a location within the
   *  instance document, otherwise the link MUST be ignored."
   *
   * @param {...*} [arguments] additional arguments to provide to request method
   * @returns {Promise} response
   */
  root () {
    return this.get('root', ...arguments)
  }

  /**
   * Performs a GET request on the Restful API resource entity
   * and returns a collection of JSON objects
   *
   * @param {string} [rel] the unique relation of the link
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  all (rel = 'instances', instance, ...args) {
    return this.action({ rel, method: 'getList', instance }, ...args)
  }

  /**
   * Performs a POST request on a Restful API resource
   *
   * @param {string} data data to use in request body
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  create (data, instance, ...args) {
    return this.action({ rel: 'create', method: 'post', instance }, undefined, data, ...args)
  }

  /**
   * Performs a PUT request on a Restful API resource entity
   *
   * @param {*} data data to use in request body
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  update (data, instance, ...args) {
    return this.action({ rel: 'update', method: 'customPUT', instance }, data, ...args)
  }

  /**
   * Performs a DELETE request on a Restful API resource entity
   *
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  delete (instance, ...args) {
    return this.action({ rel: 'delete', method: 'delete', instance }, ...args)
  }

  /**
   * Generates an empty form that maps to the Restul API
   * resource entity and its JSON Hyper-Schema
   *
   * @returns {Object} empty form object (not a resource!)
   */
  form () {
    return empty(this.schema)
  }

}