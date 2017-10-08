import axios from 'axios'

export class HyperLink {

  consructor ({ rel, entity, method, href, encType, targetSchema }) {
    this.rel     = rel
    this.entity  = entity
    this.method  = method
    this.href    = href
    this.encType = encType
    this.targetSchema = targetSchema
  }

  /**
   * Determines the URL of a Link Description Object by cross-referencing
   * the entity instance object with the relevant JSON Hyper-Schema
   *
   * @param {string} rel local unique relation type of the link
   * @param {Object} [instance] object to use as the resource entity instance
   * @returns {Promise<String>} URL of the Link Description Object (LDO)
   */
  url (entity = this.entity) {
    let url       = this.href
    const matches = this.href.match(/\\{{.*?\}/gi) || []

    matches.forEach(match => {
      const key = match.replace(/[\])}[{(]/g, '')
      const sub = key instanceof Object && key ? entity[key] : null

      url = url.replace(match, sub)
    })

    return url
  }

  /**
   * Generates a unique Axios-based resource built upon the processed URL
   * of the Link Description Object (LDO)
   *
   * @param {string} rel local unique relation type of the link
   * @param {Object} [instance] object to use as the resource entity instance
   * @param {boolean} [collection] whether or not the resource represents a collection
   * @returns {Promise<Axios>} Axios HTTP resource
   */
  resource ({ method, headers, entity = this.entity }) {
    return axios({ url: this.url(entity), method, headers })
  }

  /**
   * Genreates a unique Axios-based resource from an LDO (based on rel).
   *
   * If no method is provided, the method defined on the source LDO will
   * be implied at run-time (this is the suggested usage, Hypermedia-friendly).
   *
   * @param {string} rel local unique relation type of the link
   * @param {string} [method] HTTP method to perform (lower-case)
   * @param {Object} [entity] object to use as the resource entity instance
   * @param {Promise<*>} resource action HTTP response
   */
  // TODO: add header based on encType if it exists
  // TODO: automatically validate data against entity.schema
  action ({ method, headers, entity = this.entity }) {
    const resource = this.resource(...arguments)
    const action   = method || this.method.toLowerCase()

    // TODO: validate that the `action` is valid

    return resource[action]
  }

}
