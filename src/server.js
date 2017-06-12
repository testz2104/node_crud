import Hapi from 'hapi';
import jwt from 'jsonwebtoken';
import routes from './routes';
var corsHeaders = require('hapi-cors-headers')

const server = new Hapi.Server();

server.connection( {
    port: 3333
});

var validate = function (request, decoded, callback) {

	console.log("Validate Function");
	
	callback(null, true, decoded);

};

// .register(...) registers a module within the instance of the API. The callback is then used to tell that the loaded module will be used as an authentication strategy.

server.register(require('hapi-auth-jwt'), function (err) {

    if(err){
      console.log(err);
    }

    server.auth.strategy('token', 'jwt', {
		key: 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy',
		validateFunc: validate,
		verifyOptions: {
			algorithms: [ 'HS256' ],
		}
    });

    routes.forEach( ( route ) => {

        console.log( 'attaching ${ route.path }' );
        server.route( route );

    } );
});

server.ext('onPreResponse', corsHeaders)

server.start( err => {

    if( err ) {

        // Fancy error handling here
        console.error( 'Error was handled!' );
        console.error( err );

    }

    console.log( `Server started at ${ server.info.uri }` );

} );