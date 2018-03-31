# hyper-mesh
> :globe_with_meridians: JSON Hyper-Schema for NodeJS
---

## Features

- Parses and validates [JSON Hyper-Schema](https://tools.ietf.org/html/draft-wright-json-schema-hyperschema-00) definitions using [`Ajv`](https://www.npmjs.com/package/ajv)
- Provides Hypermedia-driven RESTful HTTP API resources powered by [`axios`](https://www.npmjs.com/package/axios)
- Automatically validates entity HTTP request bodies against their associated JSON Schemas
- Manages a centralized index of your JSON Hyper-Schemas for easy referencing

## Insall

`npm install --save slurmulon/hyper-mesh`

## Usage

```js
import { HyperApi } from 'hyper-mesh'

export const demo = async () => {
  const api = await new HyperApi('http://api.madhax.io/schemas/root.json').index()
  const { schema, resource } = api

  const resources = {
    user  : resource('user.json'),
    cart  : resource('cart.json'),
    order : resource('order.json')
  }

  // perform some GET requests on our API resources
  const user   = await resources.user.get()
  const cart   = await resources.cart.get()
  const orders = await resources.order.all()

  // create a new entity via POST
  await resources.user.create({ username: 'madhax', password: 'abc123' })

  // delete an API resource entity
  await resources.orders.delete(orders[0].uuid)
}

await demo()
```

## License

MIT
