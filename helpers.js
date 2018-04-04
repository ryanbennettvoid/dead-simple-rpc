
const helpers = {};

helpers.parseSocketRequest = ( data ) => {

  // data: "{
  //   functionName: String,
  //   args: Object
  // }"

  const message = JSON.parse( data.toString() ); // let it throw exception

  const { 
    functionName,
    args
  } = message;

  // do middleware stuff here

  return message;

};

helpers.parseSocketResponse = ( data ) => {

  // data: "{
  //   timestamp_fn_start: Number,
  //   timestamp_fn_end: Number,
  //   err: String,
  //   results: Object
  // }"

  const message = JSON.parse( data.toString() ); // let it throw exception

  const { 
    timestamp_fn_start,
    timestamp_fn_end,
    err, 
    results
  } = message;

  // do middleware stuff here

  return message;

};


module.exports = helpers;