'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _gridfsStream = require('gridfs-stream');

var _gridfsStream2 = _interopRequireDefault(_gridfsStream);

var _multerGridfsStorage = require('multer-gridfs-storage');

var _multerGridfsStorage2 = _interopRequireDefault(_multerGridfsStorage);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var gracefulShutdown;
var connection;

var Database = function Database(dbURI, testURI) {
	var _this = this;

	_classCallCheck(this, Database);

	this.gfs;
	this.connection;
	this.upload;

	if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
		this.connection = _mongoose2.default.createConnection(process.env.MONGODB_URI);
	} else if (process.env.NODE_ENV === 'test') {
		this.connection = _mongoose2.default.createConnection(testURI);
	} else {
		this.connection = _mongoose2.default.createConnection(dbURI);
	}

	this.connection.once('open', function () {
		console.log("[server] mongoose connected to " + dbURI);
		_this.gfs = (0, _gridfsStream2.default)(_this.connection.db, _mongoose2.default.mongo);
		_this.gfs.collection('uploads');
		console.log("[server] gridfs functioning");
	});
	this.connection.on('error', function (err) {
		console.log('[server] mongoose connection error: ' + err);
	});
	this.connection.on('disconnected', function () {
		console.log('[server] mongoose disconnected');
	});

	_mongoose2.default.Promise = global.Promise;

	// CAPTURE APP TERMINATION / RESTART EVENTS
	// To be called when process is restarted or terminated
	gracefulShutdown = function gracefulShutdown(msg, callback) {
		_mongoose2.default.connection.close(function () {
			console.log('[server] mongoose disconnected through ' + msg);
			callback();
		});
	};
	// For nodemon restarts
	process.once('SIGUSR2', function () {
		gracefulShutdown('[server] nodemon restart', function () {
			process.kill(process.pid, 'SIGUSR2');
		});
	});
	// For app termination
	process.on('SIGINT', function () {
		gracefulShutdown('[server] app termination', function () {
			process.exit(0);
		});
	});
	// For Heroku app termination
	process.on('SIGTERM', function () {
		gracefulShutdown('[server] heroku app termination', function () {
			process.exit(0);
		});
	});

	var storage = new _multerGridfsStorage2.default({
		url: dbURI,
		file: function file(req, _file) {
			req.body.filepath, console.log("[upload] uploading:", req.body.filepath);
			var filename = (0, _md2.default)(req.body.filepath) + _path2.default.extname(_file.originalname);
			_this.gfs.remove({ filename: filename, root: 'uploads' }, function (err, gridStore) {
				if (err) return;
			});
			return {
				filename: filename,
				bucketName: 'uploads',
				metadata: {
					path: req.body.filepath
				}
			};
		}
	});
	this.upload = (0, _multer2.default)({ storage: storage });
};

exports.default = Database;