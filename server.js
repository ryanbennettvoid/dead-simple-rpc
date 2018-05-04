
const { MSG_DELIMITER } = require( './constants' );

const Log = require( 'log' ), log = new Log();
const Promise = require( 'bluebird' );
const deepmerge = require( 'deepmerge' );
const net = require( 'net' );
const helpers = require( './helpers.js' );

const DEFAULT_OPTIONS = {
  host: 'localhost',
  port: 7889,
  handlers: {},
  debug: false
};

// ---

const handleRequest = ( socket, handlers, fullResponse ) => {

  const request = helpers.parseSocketRequest( fullResponse );

  const { functionName, args } = request;

  // if function not found...
  if ( typeof handlers[ functionName ] !== 'function' ) {
    socket.write( JSON.stringify( { err: `function ${functionName} not found` } ) + MSG_DELIMITER );
    return;
  }

  // evoke function...
  const timestamp_fn_start = Date.now();

  handlers[ functionName ]( args, ( err, results ) => {

    const timestamp_fn_end = Date.now();

    const response = {
      timestamp_fn_start,
      timestamp_fn_end,
      err,
      results
    };

    socket.write( JSON.stringify( response ) + MSG_DELIMITER, 'utf8', () => {

    } );

  } );

};

// --

const Server = ( options ) => {

  const { host, port, handlers, debug } = deepmerge.all( [ {}, DEFAULT_OPTIONS, options ] );

  if ( debug ) log.debug( 'server init args: ', host, port, handlers, debug );

  let s;

  return {

    listen: () => {

      return new Promise( ( resolve, reject ) => {

        // create server and listen

        s = net.createServer( ( socket ) => {

          let fullResponse = '';

          socket.on( 'data', ( data ) => {
            const str = data.toString();
            if ( debug ) log.debug( 'server onData: ', str );
            fullResponse += str;
            if ( str.includes( MSG_DELIMITER ) ) {
              try {
                handleRequest( socket, handlers, fullResponse );
              } catch ( err ) {
                return reject( err );
              }
            }
          } );

          socket.on( 'end', () => {
            if ( debug ) log.debug( 'server onEnd' );
          } )

          socket.on( 'close', ( socketErr ) => {
            if ( debug ) log.debug( 'server socket close: ', fullResponse, 'socketErr:', socketErr );
          } );

        } );

        s.listen( port, host );

        resolve();

      } );

    },

    close: () => {

      return new Promise( ( resolve, reject ) => {

        if ( s ) {
          s.close( () => {
            if ( debug ) log.debug( 'server closed' );
            s = null;
          } );
        }

        resolve();

      } );

    }

  };

};

module.exports = Server;