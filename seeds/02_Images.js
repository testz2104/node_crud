exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  var tableName = 'images';

    var rows = [

        // You are free to add as many rows as you feel like in this array. Make sure that they're an object containing the following fields:
        {
			owner: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
            guid: '4c8d84f1-9e41-4e78-a254-0a5680cd19d5',
            image_title: 'Sample Image',
            image_type: 'png',
        },

		{
			owner: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
            guid: 'ddb8a136-6df4-4cf3-98c6-d29b9da4fbc6',
            image_title: 'Sample Image',
            image_type: 'png',
        },
    ];

    return knex( tableName )
        // Empty the table (DELETE)
        .del()
        .then( function() {
            return knex.insert( rows ).into( tableName );
        });
};