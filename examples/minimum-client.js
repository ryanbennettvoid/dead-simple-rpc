
const rpc = require( '../index.js' );

const client = rpc.Client();

client.evoke( 'getMessage', { cake: 'isGood' } )
.then( ( response ) => {
  console.log( 'response: ', response );
} )
.catch( ( err ) => {
  console.error( 'an error occured: ', err );
} )
;