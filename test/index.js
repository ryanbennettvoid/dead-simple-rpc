
const Promise = require( 'bluebird' );
const test = require( 'tape' );
const rpc = require( '../index.js' );
const fs = require( 'fs' );

const options = {
  port: 9999,
  debug: true
};

let server;

test( 'create server', ( t ) => {

  const serverOptions = Object.assign( {}, options, {
    handlers: {
      add: ( { a, b }, callback ) => {
        setTimeout( () => {
          callback( null, a + b );
        }, 500 )
      },
      getBigData: ( { blob }, callback ) => {
        const str = fs.readFileSync( './test/large-data.txt', 'utf8' );
        if ( blob === str ) return callback( null, str );
        return callback( 'blob mismatch' );
      }
    }
  } );

  server = rpc.Server( serverOptions );

  server.listen()
  .then( () => {
    t.pass( 'created server' );
  } )
  .catch( ( err ) => {
    t.fail( err, 'failed to create server' );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'client connect to server and evoke method', ( t ) => {

  const clientOptions = Object.assign( {}, options );

  const client = rpc.Client( clientOptions );

  return client.evoke( 'add', { a: 2, b: 7 } )
  .then( ( response ) => {

    const {
      timestamp_fn_start,
      timestamp_fn_end,
      err,
      results
    } = response;

    t.equal( typeof timestamp_fn_start, 'number', 'timestamp_fn_start valid' );
    t.equal( typeof timestamp_fn_end, 'number', 'timestamp_fn_end valid' );
    t.notOk( err, 'no error' );
    t.equal( results, 9, 'results is valid' );

    return client.evoke( 'add', { a: 5, b: 5 } )

  } )
  .then( ( response ) => {

    const { results } = response;

    t.equal( results, 10 );
    t.pass( 'client connected to server' );

  } )
  .catch( ( err ) => {

    t.fail( err );

  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'large data', ( t ) => {

  const clientOptions = Object.assign( {}, options );

  const client = rpc.Client( clientOptions );

  const str = fs.readFileSync( './test/large-data.txt', 'utf8' );

  return client.evoke( 'getBigData', { blob: str } )
  .then( ( { err, results } ) => {
    t.notOk( err );
    t.equals( results, str );
    t.pass( 'fetched big data' );
  } )
  .catch( ( err ) => {
    t.notOk( err );
    t.fail( 'could not fetch big data' );
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'connect to non-existant server', ( t ) => {

  const clientOptions = { port: 4444 };

  const client = rpc.Client( clientOptions );

  return client.evoke( 'add', { a: 2, b: 7 } )
  .then( ( response ) => {

    t.fail( 'no response should be returned' );

  } )
  .catch( ( err ) => {

    t.ok( err, 'error is valid' );
    t.pass( 'connect to non-existant server' );

  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'concurrent evokes (1 connection)', ( t ) => {

  const clientOptions = Object.assign( {}, options );

  const client = rpc.Client( clientOptions );

  const nums = [];

  for ( let i = 0; i < 200; i++ ) {
    nums.push( i );
  }

  return Promise.map( nums, ( i ) => {
    return client.evoke( 'add', { a: i, b: i } )
    .then( ( { err, results } ) => {
      if ( results !== ( i + i ) ) throw `invalid results: ${JSON.stringify( results )}`;
      return results;
    } )
    ;
  }, { concurrency: 50 } )
  .then( ( response ) => {

    t.equal( response.length, nums.length );
    t.pass( 'concurrenct evokes (1 connection)' );

  } )
  .catch( ( err ) => {

    t.fail( err );

  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'concurrent evokes (multiple connections)', ( t ) => {

  const clientOptions = Object.assign( {}, options );

  const nums = [];

  for ( let i = 0; i < 100; i++ ) {
    nums.push( i );
  }

  return Promise.map( nums, ( i ) => {

    const client = rpc.Client( clientOptions );

    return client.evoke( 'add', { a: i, b: i } )
    .then( ( { err, results } ) => {
      if ( results !== ( i + i ) ) throw `invalid results: ${JSON.stringify( results )}`;
      return results;
    } )
    ;

  }, { concurrency: 20 } )
  .then( ( response ) => {

    t.equal( response.length, nums.length );
    t.pass( 'concurrenct evokes (multiple connections)' );

  } )
  .catch( ( err ) => {

    t.fail( err );

  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'close server', ( t ) => {

  return server.close()
  .then( () => {
    t.pass( 'server closed' );
  } )
  .catch( ( err ) => {
    t.notOk( err );
    t.fail();
  } )
  .finally( () => {
    t.end();
  } )
  ;

} );

test( 'connect to closed server', ( t ) => {

  const clientOptions = Object.assign( {}, options );

  const client = rpc.Client( clientOptions );

  return client.evoke( 'add', { a: 2, b: 7 } )
  .then( ( response ) => {

    t.fail( 'there should be no response' );

  } )
  .catch( ( err ) => {

    t.pass( 'there should be an error' );

  } )
  .finally( () => {
    t.end();
    process.exit();
  } )
  ;

} );
