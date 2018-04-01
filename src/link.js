import axios from 'axios'

/**
 * Represents an individual Link Description Object (LDO) belonging
 * to a JSON Hyper-Schema entity.
 *
 * @see http://json-schema.org/latest/json-schema-hypermedia.html#ldo
 * @see http://json-schema.org/latest/json-schema-hypermedia.html#uriTemplating
 * @see http://json-schema.org/latest/json-schema-hypermedia.html#input
 * @see http://json-schema.org/latest/json-schema-hypermedia.html#json-schema
 */
// TODO: support:
//  - anchor
//  - anchorPointer
//  - collection vs. item
export class HyperLink {

  consructor ({ rel, entity, method, href, encType, targetSchema }) {
    this.rel     = rel
    this.entity  = entity
    this.method  = method
    this.href    = href
    this.encType = encType
    this.targetSchema = targetSchema
  }

  // TOOD: get headers

  /**
   * Compiles the URL of an LDO by resolving any JSON Pointer URI template variables
   * with entity instance data
   *
   * @param {Object} [entity] object to use as the resource entity instance
   * @returns {Promise<String>} URL of the Link Description Object (LDO)
   */
  // TODO: support latest version of Hyper-Schema, adds lots of features here
  //  - @see http://json-schema.org/latest/json-schema-hypermedia.html#uriTemplating
  //  - `templatePointers`
  //  - `templateRequired`
  //  - `targetMediaType` (soft)
  url (entity = this.entity) {
    let url       = this.href
    const matches = this.href.match(/\\{{.*?\}/gi) || []

    matches.forEach(match => {
      const key = match.replace(/[\])}[{(]/g, '')
      const sub = key ? entity[key] : null

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
  // TODO:
  //  - `headerSchema` (@see http://json-schema.org/latest/json-schema-hypermedia.html#headerSchema)
  //  - `submissionMediaType` (@see http://json-schema.org/latest/json-schema-hypermedia.html#rfc.section.6.6.4.1)
  //  - `submissionSchema` (@see http://json-schema.org/latest/json-schema-hypermedia.html#rfc.section.6.6.4.2)
  resource ({ method, headers, entity = this.entity }) {
    return axios({ url: this.url(entity), method, headers })
  }

  /**
   * Generates a unique Axios-based resource from an LDO (based on rel).
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
  // FIXME: `method` is no longer supported by Hyper-Schema
  action ({ method, headers, entity = this.entity }) {
    const resource = this.resource(...arguments)
    const action   = method || this.method.toLowerCase()

    if (!resource.hasOwnProperty(action) || !(action instanceof Function)) {
      throw new Error(`Unsupported HTTP action: ${action}`)
    }

    return resource[action]
  }

}
