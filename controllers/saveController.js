var buf = require('buffer');
var path = require('path');
var fs = require('fs');
var util = require('util');
var uuid = require('uuid');
var gm = require('gm').subClass({
	imageMagick: true //默认的情况下 gm使用的是另外一个图片处理程序
});

var app = process.app;
var targetDir = app.get('targetDir');
var contentTypes = app.get('contentType');


/*
    请求包含如下参数：
    @ext    图片扩展名
    @buffer 图片buffer数据
*/
app.post('/upload', function(req, res, next) {
	var ext = req.body.ext;
	var buffer = req.body.buffer;

	if (!(ext && buffer && contentTypes[ext]))
		return res.json({
			message: '文件格式不正确或内容为空！',
			success: false
		});

	var date = new Date();
	var folder = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
	var pathArgs = folder.split('/');
	createDir(pathArgs);

	pathArgs.push('');

	var filePathURL = createPath(pathArgs, ext);

	var base64Data = buffer.replace(/^data:image\/\w+;base64,/, "");
	var dataBuffer = new buf.Buffer(base64Data, 'base64');
	gm(dataBuffer).autoOrient().write(filePathURL.filePath, function(err) {
		if (err) return res.json({
			success: false,
			message: err
		});

		res.json({
			success: true,
			imageURL: filePathURL
		});
	});
});


function createDir(pathArgs) {
	if (pathArgs.length == 0) return;
	var dir = path.join(targetDir, path.join.apply(path, pathArgs));
	var exists = fs.existsSync(dir);
	if (!exists) {
		// 递归创建文件夹
		createDir(pathArgs.slice(0, pathArgs.length - 1));
		fs.mkdirSync(dir);
	}
}

function createPath(pathArgs, ext) {
	var args = [targetDir];
	pathArgs[pathArgs.length - 1] = uuid.v1().replace(/-/g, '');
	args.push.apply(args, pathArgs);
	var filePath = path.join.apply(path, args) + '.' + ext;
	var fileKey = path.join.apply(path, pathArgs) + '.' + ext;
	return fs.existsSync(filePath) ? createPath(pathArgs, ext) : {
		filePath: filePath,
		fileKey: fileKey
	};
}