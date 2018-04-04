
const rpc = require( '../index.js' );

const options = {
  port: 7777,
  handlers: {
    getMessage: ( args, callback ) => {
      const message = `Helloez! Your args: ${JSON.stringify( args )}`;
      setTimeout( () => {
        callback( null, message );
      }, 500 )
    }
  }
};

const server = rpc.Server( options );

server.listen()
.then( () => {

  const client = rpc.Client( options );

  return client.evoke( 'getMessage', { cake: 'is good' } );

} )
.then( ( response ) => {

  console.log( 'results: ', JSON.stringify( response, null, 4 ) );

  // results:  {
  //   "timestamp_fn_start": 1522804238670,
  //   "timestamp_fn_end": 1522804239174,
  //   "err": null,
  //   "results": "Helloez! Your args: {\"cake\":\"is good\"}"
  // }

} )
.catch( ( err ) => {

  console.error( 'an error occured: ', err );

} )
;