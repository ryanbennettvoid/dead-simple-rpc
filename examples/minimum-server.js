
const rpc = require( '../index.js' );

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