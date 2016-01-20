var bodyParser = require('body-parser');
var app = require("express")();
process.app = app;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false,
	limit: '100000000kb'
}));


require("./config")(__dirname, app); //"/Users/picker/Desktop/"
var mode = app.get('mode');

require('./controllers/saveController');
require('./controllers/readController');

var config = app.get(mode);

require("http").createServer(app).listen(config.port, function() {
	console.log('%s已经启动，正监听:%s', config.name, config.port);
});