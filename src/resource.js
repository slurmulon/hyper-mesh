/**
 * Provides a pragmatic interface for interacting with a JSON Hyper-Schema based Restful HTTP API.
 *
 * Unifies a JSON Hyper-Schema document with Axios, a popular Node HTTP module
 */
export class HyperResource {

  /**
   * @param {HyperSchema} schema
   */
  constructor (schema) {
    this.schema = schema
  }

  /**
   * Provides the Link Description Object matching a relation type (rel).
   *
   * @param {string} rel the unique relation of the link
   * @returns {Promise<HyperLink>} Link Description Object matching rel
   */
  link (rel) {
    return this.schema.linkBy({ rel })
  }

  /**
   * Generates a unique Axios-based resource from an LDO (based on rel)
   * and then automatically performs an HTTP operation based on its "method".
   *
   * @param {string} rel the unique relation of the link
   * @param {string} [method] HTTP method to perform (lower-case)
   * @param {Object} [headers] HTTP headers to send in request
   * @param {Object} [instance] object to use as the resource entity instance in request
   * @param {...*} [args] additional arguments to provide to resource HTTP action
   * @param {Promise} resource action response
   */
   // TODO: add header based on encType if it exists
   // TODO: automatically validate data against entity.schema
  async action ({ rel, method, headers, instance }, ...args) {
    const link   = this.link(rel)
    const action = link.action({ method, headers, entity: instance })

    return action(...args)
  }

  /**
   * Performs an HTTP GET request on the Restful API resource
   * and returns a single JSON object.
   *
   * "The object represents a resource and the instance object
   * is treated as a full representation of the target resource
   * identified by the specified URI"
   *
   * @param {string} [rel] unique relation of the link
   * @param {Object} [instance] resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  // TODO: consider supporting `all` as well to be consistent with the `one` vs. `all` paradigm
  get (rel = 'self', instance, ...args) {
    return this.action({ rel, method: 'get', instance }, ...args)
  }

  /**
   * Performs a HTTP GET request on the Restful API resource and returns
   * a full representation JSON object.
   *
   * "The target of the link is the full representation for the instance object"
   *
   * @param {...*} [arguments] additional arguments to provide to request
   * @returns {Promise} response
   */
  full () {
    return this.get('full', ...arguments)
  }

  /**
   * Performs an HTTP GET request on the Restful API resource and returns
   * a schema describing the instance JSON object.
   *
   * "The target of the link is a schema describing the instance object.
   *  This MAY be used to specifically denote the schemas of objects
   *  within a JSON object hierarchy, facilitating polymorphic
   *  type data structures"
   *
   * @param {...*} [arguments] additional arguments to provide to request
   * @returns {Promise} response
   */
  describedBy () {
    return this.get('describedBy', ...arguments)
  }

  /**
   * Performs an HTTP GET request on the Restful API resource and returns
   * a JSON object that should be used as the root entity during
   * user agent interactions.
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
   * Performs an HTTP GET request on the Restful API resource entity
   * and returns a collection of JSON objects.
   *
   * @param {string} [rel] the unique relation of the link
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  all (rel = 'instances', instance, ...args) {
    return this.action({ rel, method: 'get', instance }, ...args)
  }

  /**
   * Performs an HTTP POST request on a Restful API resource entity.
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
   * Performs an HTTP PUT request on a Restful API resource entity.
   *
   * @param {*} data data to use in request body
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  update (data, instance, ...args) {
    return this.action({ rel: 'update', method: 'put', instance }, data, ...args)
  }

  /**
   * Performs an HTTP DELETE request on a Restful API resource entity.
   *
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {...*} [args] additional arguments to provide to request method
   * @returns {Promise} response
   */
  delete (instance, ...args) {
    return this.action({ rel: 'delete', method: 'delete', instance }, ...args)
  }

}
