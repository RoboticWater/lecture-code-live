import mongoose from 'mongoose'

var gracefulShutdown;
var dbURI = 'mongodb://localhost:27017/lecturecode'; // localhost default
var testURI = 'mongodb://localhost:27017/lecturecode-test';
if (process.env.NODE_ENV === 'development' || 
	process.env.NODE_ENV === 'staging' || 
	process.env.NODE_ENV === 'production') {
	dbURI = process.env.MONGODB_URI;
}
if (process.env.NODE_ENV === 'test') {
	dbURI = testURI;
}

mongoose.connect(dbURI, { useNewUrlParser: false });

// CONNECTION EVENTS
mongoose.connection.on('connected', function () {
	console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function (err) {
	console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
	console.log('Mongoose disconnected');
});

mongoose.Promise = require('bluebird');

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function (msg, callback) {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected through ' + msg);
		callback();
	});
};
// For nodemon restarts
process.once('SIGUSR2', function () {
	gracefulShutdown('nodemon restart', function () {
		process.kill(process.pid, 'SIGUSR2');
	});
});
// For app termination
process.on('SIGINT', function () {
	gracefulShutdown('app termination', function () {
		process.exit(0);
	});
});
// For Heroku app termination
process.on('SIGTERM', function () {
	gracefulShutdown('Heroku app termination', function () {
		process.exit(0);
	});
});

// BRING IN YOUR SCHEMAS & MODELS
require('./users.model');
require('./files.model');