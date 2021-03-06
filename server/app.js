import express from'express';
import bodyParser from'body-parser';
import methodOverride from'method-override';
import util from 'util';
import mongoose from 'mongoose';
import path from 'path';
import socketIO from 'socket.io';
import http from 'http';

import Database from './models/db';

import * as upload from './controllers/upload.controller';
import * as files from './controllers/files.contoller';

var PORT = process.env.PORT || 3001;

const app = express();
const router = express.Router();
const db = new Database(process.env.MONGODB_URI, process.env.MONGODB_URI);
const server = http.Server(app);
const io = socketIO(server);
app.io = io;
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('connected','[socket] connected to server')
  socket.on('disconnect', () => console.log('Client disconnected'));
});

app.use(express.static(path.join(__dirname, '/../client/build')))
app.use(bodyParser.json());
app.use(methodOverride('_method'));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'))
})

router.post('/upload', db.upload.single('file'), (req, res) => upload.upload(req, res))
router.get('/files', (req, res) => files.getFiles(req, res, db))
router.get('/files/:filename', (req, res) => files.getContent(req, res, db))
router.post('/files/deletepath', (req, res) => files.deleteFileByPath(req, res, db))
router.post('/files/:filename', (req, res) => files.getFile(req, res, db))
router.delete('/files/:filename', (req, res) => files.deleteFile(req, res, db))
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

  var bind = typeof PORT === 'string'
    ? 'Pipe ' + PORT
    : 'Port ' + PORT;

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
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.PORT;
  debug('Listening on ' + bind);
}


//export default app;


