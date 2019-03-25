'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _db = require('./models/db');

var _db2 = _interopRequireDefault(_db);

var _upload = require('./controllers/upload.controller');

var upload = _interopRequireWildcard(_upload);

var _files = require('./controllers/files.contoller');

var files = _interopRequireWildcard(_files);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PORT = process.env.PORT || 3001;

var app = (0, _express2.default)();
var router = _express2.default.Router();
var db = new _db2.default(process.env.MONGODB_URI, process.env.MONGODB_URI);
var server = _http2.default.Server(app);
var io = (0, _socket2.default)(server);
app.io = io;
io.on('connection', function (socket) {
  console.log('Client connected');
  socket.emit('connected', '[socket] connected to server');
  socket.on('disconnect', function () {
    return console.log('Client disconnected');
  });
});

app.use(_express2.default.static(_path2.default.join(__dirname, '/../client/build')));
app.use(_bodyParser2.default.json());
app.use((0, _methodOverride2.default)('_method'));

router.get('/', function (req, res) {
  res.sendFile(_path2.default.join(__dirname + '/../client/build/index.html'));
});

router.post('/upload', db.upload.single('file'), function (req, res) {
  return upload.upload(req, res);
});
router.get('/files', function (req, res) {
  return files.getFiles(req, res, db);
});
router.get('/files/:filename', function (req, res) {
  return files.getContent(req, res, db);
});
router.post('/files/deletepath', function (req, res) {
  return files.deleteFileByPath(req, res, db);
});
router.post('/files/:filename', function (req, res) {
  return files.getFile(req, res, db);
});
router.delete('/files/:filename', function (req, res) {
  return files.deleteFile(req, res, db);
});
app.use('/api', router);

server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

var debug = require('debug')('web:server');

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.PORT;
  debug('Listening on ' + bind);
}

//export default app;