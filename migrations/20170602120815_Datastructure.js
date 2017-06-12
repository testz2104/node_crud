
exports.up = function(knex, Promise) {
	return knex
	.schema
	.createTable( 'images', function( imagesTable ) {

		// Data
		imagesTable.increments('id').primary().unsigned();
		imagesTable.string( 'owner', 50 ).notNullable().references( 'guid' ).inTable( 'users' );
		imagesTable.string( 'guid', 50 ).notNullable().unique();
		imagesTable.string( 'image_title', 255 ).notNullable();
		imagesTable.string( 'image_type', 255 ).notNullable();
		imagesTable.string( 'file', 255 ).nullable();
		imagesTable.timestamp( 'created' ).notNullable();

	} )
};

exports.down = function(knex, Promise) {
	return knex
        .schema
            .dropTableIfExists( 'images' );
};
