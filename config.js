exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       (process.env.NODE_ENV === 'production' ?
                            'mongodb://gFedz4321:33bask873F@ds155841.mlab.com:55841/heavenly-whirlwind' :
                            'mongodb://localhost/shopping-list-dev');
exports.PORT = process.env.PORT || 8080;