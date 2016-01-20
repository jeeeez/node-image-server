var path = require('path');
var fs = require('fs');
var gm = require('gm').subClass({
	imageMagick: true //默认的情况下 gm使用的是另外一个图片处理程序
});

var app = process.app;
var config = app.get('read');
var targetDir = app.get('targetDir');

var contentTypes = app.get('contentType');


app.get('/:filename', function(req, res, next) {
	sendFile([], req, res);
});
app.get('/:folder/:filename', function(req, res, next) {
	sendFile([req.params.folder], req, res);
});
app.get('/:folder1/:folder2/:filename', function(req, res, next) {
	sendFile([req.params.folder1, req.params.folder2], req, res);
});
app.get('/:folder1/:folder2/:folder3/:filename', function(req, res, next) {
	sendFile([req.params.folder1, req.params.folder2, req.params.folder3], req, res);
});



function sendFile(folders, req, res) {
	var filename = req.params.filename;
	var query = req.query;
	var ext = path.extname(filename).substr(1);
	if (!contentTypes) return res.sendfile(getFilePath());

	folders.push(filename);
	var filePath = getFilePath(path.join.apply(path, folders));
	fs.exists(filePath, function(exists) {
		gm(filePath)
			.resize(200, 200)
			.crop(150, 150, 0, 0)
			// .thumbnail(100)
			.identify(function(err, data) {
				var ext = data['Mime type'];
				this.toBuffer(function(err, buffer) {
					res.set('Content-Type', (['image/jpeg', 'image/jpeg', 'image/gif', 'image/png'].indexOf(ext) > -1) ? ext : "application/octet-stream"); //application/octet-stream
					res.send(new Buffer(buffer));
				});
			});

		// res.sendfile(exists ? filePath : getFilePath());
	});
}

function getFilePath(filename) {
	return path.join(targetDir, filename || config.default);
}