
const Log = require( 'log' ), log = new Log();
const Promise = require( 'bluebird' );
const deepmerge = require( 'deepmerge' );
const net = require( 'net' );
const helpers = require( './helpers.js' );

const testMessage = {
  functionName: '___test',
  args: { a: 2, b: 7 }
};

const DEFAULT_OPTIONS = {
  host: '127.0.0.1',
  port: 7889,
  handlers: ( () => {
    // generate function from testMessage
    const obj = {};
    obj[ testMessage.functionName ] = ( args, callback ) => {
      const stringArgs = JSON.stringify( args );
      const argsMatch = stringArgs === JSON.stringify( testMessage.args );
      if ( !argsMatch )  return callback( `invalid test message args ${ stringArgs }` )
      callback( null, 'ok' );
    };
    return obj;
  } )(),
  debug: false
};

const Server = ( options ) => {

  const { host, port, handlers, debug } = deepmerge.all( [ {}, DEFAULT_OPTIONS, options ] );

  if ( debug ) log.debug( 'server init args: ', host, port, handlers, debug );

  const handleSocket = ( { socket, data } ) => {

    const request = helpers.parseSocketRequest( data );

    const { functionName, args } = request;

    // if function not found...
    if ( typeof handlers[ functionName ] !== 'function' ) {
      socket.write( JSON.stringify( { err: `function ${functionName} not found` } ) );
      return;
    }

    // evoke function...
    const timestamp_fn_start = ( new Date() ).getTime();

    handlers[ functionName ]( args, ( err, results ) => {

      const timestamp_fn_end = ( new Date() ).getTime();

      const response = {
        timestamp_fn_start,
        timestamp_fn_end,
        err,
        results
      };

      socket.write( JSON.stringify( response ) );

    } );

  };

  let s;

  return {

    listen: () => {

      return new Promise( ( resolve, reject ) => {

        // create server and listen

        s = net.createServer( ( socket ) => {
          socket.on( 'data', ( data ) => {
            handleSocket( { socket, data } );
          } );
        } );

        s.listen( port, host );

        // create test client and evoke test function

        const c = net.Socket();

        c.connect( port, host );

        c.write( JSON.stringify( testMessage ) );

        c.on( 'data', ( data ) => {
          const message = helpers.parseSocketResponse( data );
          const { results } = message;
          if ( results !== 'ok' ) return reject( `initial test connection failed -- message: ${JSON.stringify( message )}` );
          resolve();
        } );

        c.end();

      } );

    },

    close: () => {

      return new Promise( ( resolve, reject ) => {

        if ( s ) return s.close( () => {
          if ( debug ) log.debug( 'server closed' );
          resolve();
        } );

        resolve();

      } );

    }

  };

};

module.exports = Server;