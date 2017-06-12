
exports.up = function(knex, Promise) {
  return knex
	.schema
	.createTable( 'users', function( usersTable ) {

		// Primary Key
		usersTable.increments('id').primary().unsigned();

		// Data
		usersTable.string( 'name', 255 ).notNullable();
		usersTable.string( 'username', 255 ).notNullable().unique();
		usersTable.string( 'email', 255 ).notNullable().unique();
		usersTable.string( 'password', 255 ).notNullable();
		usersTable.string( 'guid', 50 ).notNullable().unique();
		usersTable.timestamp( 'created' ).notNullable();

	} )
};

exports.down = function(knex, Promise) {
	return knex
        .schema
            .dropTableIfExists( 'users' );
};
