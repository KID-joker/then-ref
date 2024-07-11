# then-ref

`then-ref` is a utility library designed to standardize the APIs of third-party libraries. It provides a consistent interface for handling both synchronous and asynchronous operations using the familiar then, catch, and finally methods.

## Features

- Consistent API: Use the same interface for both synchronous and asynchronous APIs.
- Proxy Handling: Access the original value and remove the proxy using the value property.

## Installation

```bash
npm install then-ref
```

## Usage

Import `thenRef` from `then-ref` and wrap your synchronous or asynchronous API.

### Synchronous API

```js
import thenRef from 'then-ref'

function syncApi() {
  // Your synchronous function here
}

thenRef(syncApi)()
  .then((res) => {
    console.log('Result:', res)
  })
  .catch((err) => {
    console.error('Error:', err)
  })
  .finally(() => {
    console.log('Operation complete.')
  })

// Access the original value and remove the proxy
const originalValue = thenRef(syncApi)().value
console.log('Original Value:', originalValue)
```

### Asynchronous API

```js
import thenRef from 'then-ref'

async function asyncApi() {
  // Your asynchronous function here
}

thenRef(asyncApi)()
  .then((res) => {
    console.log('Result:', res)
  })
  .catch((err) => {
    console.error('Error:', err)
  })
  .finally(() => {
    console.log('Operation complete.')
  })

// Access the original value and remove the proxy
const originalAsyncValue = await thenRef(asyncApi)().value
console.log('Original Value:', originalAsyncValue)
```

## How It Works

`then-ref` wraps your API (synchronous or asynchronous) and returns a proxy object. This proxy object supports then, catch, and finally methods to handle the API's result consistently, regardless of its nature (sync or async).

The value property allows you to access the original value and remove the proxy. For asynchronous APIs, the value property still returns a promise, so you need to await it to get the final result.
