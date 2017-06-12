import Knex from './knex';
import jwt from 'jsonwebtoken';
import GUID from 'node-uuid';

var OutOfScope = function (request, reply) {

	const getOperation = Knex( 'images' ).where( {

		// Equiv. to `username: username`
		owner: request.auth.credentials.scope,
		id: request.params.id

	} ).select( '*' ).then( ( image ) => {
	
		if( image.length > 0 ) {

			reply( {

				error: true,
				errMessage: 'You cannot modify the details of the image as you are not the owner',

			} ).takeover();

		}

	} ).catch( ( err ) => {

		reply( {
			
			error: true,
			message: 'server-side error'
		
		} ).code(500).takeover();

	} );
	
	reply.continue();
};

var IsPresent = function (request, reply) {

	const getOperation = Knex( 'images' ).where( {

		// Equiv. to `username: username`
		id: request.params.id

	} ).select( '*' ).then( ( image ) => {
	
		if( image.length <= 0 ) {

			reply( {

				error: true,
				errMessage: 'Invalid Image',

			} ).takeover();

		}

	} ).catch( ( err ) => {

		reply( {
			
			error: true,
			message: 'server-side error'
		
		} ).code(500).takeover();

	} );
	
	reply.continue();
};


const routes = [
	{

		path: '/users/login',
		method: 'POST',
		config: { 
			auth: false,
			cors: {
				origin: ['*']
			},
		},
		handler: ( request, reply ) => {

			console.log("Login Flow Start");
			
			// This is a ES6 standard
			const { username, password } = request.payload;

			const getOperation = Knex( 'users' ).where( {

				// Equiv. to `username: username`
				username,

			} ).select( 'guid', 'password' ).then( ( user ) => {
			
				if( !user ) {

					reply( {

						error: true,
						errMessage: 'the specified user was not found',

					} );

				}
				
				// Honestly, this is VERY insecure. Use some salted-hashing algorithm and then compare it.
				if( user[0].password === password ) {

					const token = jwt.sign( {

						// You can have anything you want here. ANYTHING. As we'll see in a bit, this decoded token is passed onto a request handler.
						username,
						scope: user[0].guid,

					}, 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy', {

						algorithm: 'HS256',
						expiresIn: '1h',

					} );

					reply( {

						token,
						scope: user.guid,

					} );

				} else {

					reply( 'incorrect password' );

				}

			} ).catch( ( err ) => {

				console.log(err);
				reply( 'server-side error' );

			} );

		}

	},
	{

		path: '/users/register',
		method: 'POST',
		config: { auth: false },
		handler: ( request, reply ) => {

			console.log("Registration Flow Start");
			// This is a ES6 standard
			/* var username = request.payload.username;
			var password = request.payload.password;
			var email = request.payload.email;
			var name = request.payload.name; */
			const { username, password, email, name } = request.payload;

			const getOperation = Knex( 'users' ).where( {

				// Equiv. to `username: username`
				username,

			} ).select( '*' ).then( ( user ) => {
			
				if( user.length > 0 ) {

					reply( {

						error: true,
						errMessage: 'the specified username already exists',

					} );

					// Force of habit. But most importantly, we don't want to wrap everything else in an `else` block; better is, just return the control.
					return;

				}
				
				const guid = GUID.v4();

				const insertOperation = Knex( 'users' ).insert( {
				
					name: name,
					username: username,
					email: email,
					password: password,
					guid,

				} ).then( ( res ) => {

					reply( {

						data: guid,
						message: 'successfully created user'

					} );

				} ).catch( ( err ) => {

					reply( 'server-side error' );

				} );

			} ).catch( ( err ) => {

				console.log(err);
				reply( 'server-side error' );

			} );

		}

	},
	{

		path: '/images',
		method: 'GET',
		config: { auth: {

                strategy: 'token',

            } },
		handler: ( request, reply ) => {
		
			console.log("Images Listings");

			// In general, the Knex operation is like Knex('TABLE_NAME').where(...).chainable(...).then(...)
			const getOperation = Knex( 'images' ).where( {

				owner: request.auth.credentials.scope

			} ).select( '*' ).then( ( images ) => {

				if( !images || images.length === 0 ) {

					reply( {

						error: true,
						errMessage: 'no images found',

					} ).code(204);

				} else {

					reply( {

						dataCount: images.length,
						data: images,

					} ).code(200);
				
				}

			} ).catch( ( err ) => {

				reply( {
			
					error: true,
					message: 'server-side error'
				
				} ).code(500);

			} );

		}

	},
	{

		path: '/images',
		method: 'POST',
		config: { 
			auth: {

                strategy: 'token',

            }
		},
		handler: ( request, reply ) => {

			const { image_title, image_type } = request.payload;
			
			const guid = GUID.v4();

			const insertOperation = Knex( 'images' ).insert( {
			
				image_title: image_title,
				image_type: image_type,
				owner: request.auth.credentials.scope,
				guid,

			} ).then( ( res ) => {

				reply( {

					data: guid,
					message: 'successfully Added Image'

				} ).code(201);

			} ).catch( ( err ) => {

				reply( {
			
					error: true,
					message: 'server-side error'
				
				} ).code(500);

			} );

		}

	},
	{

		path: '/images/{id}',
		method: 'PUT',
		config: { 
			auth: {

                strategy: 'token',

            },
			pre: [[{ method: OutOfScope}, { method: IsPresent}]]
		},
		handler: ( request, reply ) => {

			const { image_title, image_type } = request.payload;

			const insertOperation = Knex( 'images' )
			.where('id', '=', request.params.id)
			.update( {
			
				image_title: image_title,
				image_type: image_type,

			} ).catch( ( err ) => {

				console.log(err);
				reply( 'server-side error' );

			} );

			reply( 'Image Updated' );
		}

	},
	{

		path: '/images/{id}',
		method: 'DELETE',
		config: { 
			auth: {

                strategy: 'token',

            },
			pre: [[{ method: OutOfScope}, { method: IsPresent}]]
		},
		handler: ( request, reply ) => {

			const insertOperation = Knex( 'images' )
			.where('id', '=', request.params.id)
			.del().catch( ( err ) => {

				console.log(err);
				reply( 'server-side error' );

			} );

			reply( 'Image Deleted' );
		}

	},
];

export default routes;