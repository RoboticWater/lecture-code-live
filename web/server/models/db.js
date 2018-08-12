import mongoose from 'mongoose'
import Grid from'gridfs-stream';
import GridFsStorage from'multer-gridfs-storage';
import multer from'multer';
import md5 from 'md5';
import path from'path';

var gracefulShutdown;
var connection;

export default class Database {
	constructor(dbURI, testURI) {
		this.gfs;
		this.connection;
		this.upload;

		if (process.env.NODE_ENV === 'development' || 
			process.env.NODE_ENV === 'staging' || 
			process.env.NODE_ENV === 'production') {
			this.connection = mongoose.createConnection(process.env.MONGODB_URI);
		}
		else if (process.env.NODE_ENV === 'test') {
			this.connection = mongoose.createConnection(testURI);
		} else {
			this.connection = mongoose.createConnection(dbURI);
		}

		this.connection.once('open', () => {
		  console.log("[server] mongoose connected to " + dbURI)
		  this.gfs = Grid(this.connection.db, mongoose.mongo);
		  this.gfs.collection('uploads');
		  console.log("[server] gridfs functioning")
		});
		this.connection.on('error', function (err) {
			console.log('[server] mongoose connection error: ' + err);
		});
		this.connection.on('disconnected', function () {
			console.log('[server] mongoose disconnected');
		});

		mongoose.Promise = global.Promise;

		// CAPTURE APP TERMINATION / RESTART EVENTS
		// To be called when process is restarted or terminated
		gracefulShutdown = function (msg, callback) {
			mongoose.connection.close(function () {
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


		const storage = new GridFsStorage({
		  url: dbURI,
		  file: (req, file) => {
		    req.body.filepath,
		    console.log("[upload] uploading:", req.body.filepath);
		    let filename = md5(req.body.filepath) + path.extname(file.originalname);
		    this.gfs.remove({filename: filename, root: 'uploads' }, (err, gridStore) => {
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
		this.upload = multer({ storage });
	}
}

