# dead-simple-rpc

`dead-simple-rpc` is a minimalistic approach to asynchronously calling remote functions with Node.js.

**Why?**
Originally inspired by `dnode`, I saw that a simpler and lighter solution could be made. And Promises are awesome.

## Examples

**Server:**
``` js
const rpc = require( 'dead-simple-rpc' );

const server = rpc.Server( {
  handlers: {
    getMessage: ( args, callback ) => {
      callback( null, `Hi. Args: ${ JSON.stringify( args ) }` )
    }
  }
} );

server.listen()
.then( () => {
  console.log( 'listening...' );
} )
.catch( ( err ) => {
  console.error( 'an error occured: ', err );
} )
;
```

**Client:**
``` js
const rpc = require( 'dead-simple-rpc' );

const client = rpc.Client();

client.evoke( 'getMessage', { cake: 'isGood' } )
.then( ( response ) => {
  console.log( 'response: ', response );
} )
.catch( ( err ) => {
  console.error( 'an error occured: ', err );
} )
;
```

## Options

**Server defaults**:
``` js
const options = {
  host: '127.0.0.1',
  port: 7889,
  handlers: {}, // dictionary of functions
  debug: false // logging
};

const server = rpc.Server( options );
```

**Client defaults:**
``` js
// same as server, but without handlers
const client = rpc.Client( options );
```

## Methods

Each method returns a promise
``` js
// --- All methods return a promise

// starts listening on the host/port specified in options
server.listen()

// closes the server
server.close()

// evokes `functionName` on the server with argument `args`; promise passes the response
// `args` can be any serializable object
client.evoke( functionName, args ) 
```

## Response

``` js
 {
  timestamp_fn_start: 1522804238670, // when the function started
  timestamp_fn_end: 1522804239174, // when the function was resolved
  err: null, // the error message
  results: {
    cake: 'isGood'
  } // the result of the function
}
```

## Testing

``` js
npm install -g tape
tape ./test
```
