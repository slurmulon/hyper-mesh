import axios from 'axios'

export class HyperLink {

  consructor ({ rel, entity, method, href, encType, targetSchema }) {
    this.rel = rel
    this.entity = entity
    this.method = method
    this.href = href
    this.encType = encType
    this.targetSchema = targetSchema
  }

  url (instance = this.entity) {
    const matches = this.href.match(/\\{{.*?\}/gi)
    let url = this.href

    const find = (matches || []).forEach(match => {
      const key = match.replace(/[\])}[{(]/g, '')
      const sub = key instanceof Object && key ? instance[key] : null

      url = url.replace(match, sub)
    })

    return url
  }

  async follow () {
    // TODO: axios[this.method]
  }

}
