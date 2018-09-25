import express from'express';
import bodyParser from'body-parser';
import methodOverride from'method-override';
import WebSocket from 'ws';
import util from 'util';
import mongoose from 'mongoose';
import path from 'path';

import Database from './models/db';

import * as upload from './controllers/upload.controller';
import * as files from './controllers/files.contoller';

var PORT = process.env.PORT || 3001;

const app = express();
const router = express.Router();
const db = new Database(process.env.MONGODB_URI, process.env.MONGODB_URI);
const SocketServer = require('ws').Server;

const wss = new SocketServer({ server: app });
wss.on('connection', (ws) => {
  console.log('[socket] connection detected');
  ws.send('[socket] connected to server')
  ws.on('message', (data) => {
    console.log(data);
  });
});

app.use(express.static(path.join(__dirname, '/../client/build')))

app.use(bodyParser.json());
app.use(methodOverride('_method'));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'))
})

router.post('/upload', db.upload.single('file'), (req, res) => upload.upload(req, res, wss))

router.get('/files', (req, res) => files.getFiles(req, res, db))
router.get('/files/:filename', (req, res) => files.getContent(req, res, db))
router.post('/files/deletepath', (req, res) => files.deleteFileByPath(req, res, db, wss))
router.post('/files/:filename', (req, res) => files.getFile(req, res, db))
router.delete('/files/:filename', (req, res) => files.deleteFile(req, res, db))


app.use('/api', router);

export default app;


