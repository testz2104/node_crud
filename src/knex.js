export default require( 'knex' )( {

    client: 'mysql',
    connection: {

        host: 'localhost',

        user: 'root',
        password: '',

        database: 'test',
        charset: 'utf8',

    }

} );