/**
 * template-web-node
 *  A template for creating websites powered by Node.js.
 *
 * Author
 *  Hannes Landstedt a.k.a. zarac
 *
 * Home / Source
 *  https://github.com/zarac/template-web-node
 */


/**
 * debug help
 */
console.eyes = require('eyes').inspector({ maxLength: 0 });


/**
 * config
 */
var DB_URL = process.env.CC_DB_URL || 'mongodb://localhost/template-web-node',
    WWW_URL = process.env.CC_WWW_URL || 'http://0.0.0.0:3001';


/**
 * database
 * <
 *  db_config
 */
var _db = require('./lib/database');
var db_config = {
    url: DB_URL,
    models: {
        log: { },
        user: {
            id: 0,
            name: 'J. Random Surfer'
        },
        wallpost: {
            id: 0,
            name: /^[a-zA-Z0-9 ]*$/,
            message: 'Some message'
        }
    }
};
var db = new _db.Database(db_config);


/**
 * web server
 * <
 *  db
 *  www_config
 */
var _www = require('./lib/webserver'),
    _path = require('path');
var config = {
    url: WWW_URL,
    views: _path.join(__dirname, '/static/views'),
    static: _path.join(__dirname, '/static')
};
var www = new _www.WebServer(db, config),
    index = require('./routes/index'),
    wall = require('./routes/wall');
//* routes
www.route.get('/', index.html5(db));
www.route.post('/wall/add', wall.add(db));


/**
 * run
 */
db.connect(DB_URL, function onConnected(con) {
    console.log('connected to database [ ' + DB_URL + ' ]');
    www.listen(WWW_URL, function onListening() {
        console.log('web server listening [ ' + WWW_URL + ' ]');
        db.log.insert({ status: 'all ok', db: DB_URL, www: WWW_URL },
            function(err, doc) {
                if (err) console.log('ERROR: ', err);
            });
    });
});
