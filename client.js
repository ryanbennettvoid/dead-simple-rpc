
const { MSG_DELIMITER } = require( './constants' );

const Log = require( 'log' ), log = new Log();
const Promise = require( 'bluebird' );
const net = require( 'net' );
const helpers = require( './helpers.js' );

const DEFAULT_OPTIONS = {
  host: 'localhost',
  port: 7889,
  debug: false
};

const Client = ( options ) => {

  const { host, port, debug } = Object.assign( {}, DEFAULT_OPTIONS, options );

  if ( debug ) log.debug( 'client init args: ', host, port, debug );

  return {

    evoke: ( functionName, args ) => {

      if ( debug ) log.debug( `sending request: ${functionName} -> ${JSON.stringify( args )}` );

      return new Promise( ( resolve, reject ) => {

        let fullResponse = '';

        const c = net.Socket();

        c.connect( port, host );

        c.write( JSON.stringify( { functionName, args } ) + MSG_DELIMITER );

        c.on( 'data', ( data ) => {
          const str = data.toString();
          if ( debug ) log.debug( 'client onData: ', str );
          fullResponse += str;
          if ( str.includes( MSG_DELIMITER ) ) {
            let message;
            try {
              message = helpers.parseSocketResponse( fullResponse );
            } catch ( err ) {
              return reject( err );
            }
            const { timestamp_fn_start, timestamp_fn_end, err, results } = message;
            if ( debug ) log.debug( `request resolved: ${functionName} -> ${timestamp_fn_end-timestamp_fn_start}ms` );
            resolve( message );
          }
        } );

        c.on( 'end', () => {
          if ( debug ) log.debug( 'client onEnd' );
        } )

        c.on( 'close', ( socketErr ) => {
          if ( debug ) log.debug( 'client socket close: ', fullResponse, 'socketErr: ', socketErr );
        } );

        c.on( 'error', ( err ) => {
          reject( err || {} );
        } );

      } );

    }

  };

};

module.exports = Client;