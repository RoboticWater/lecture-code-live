import express from 'express';

import Database from '../models/db';

import * as upload from '../controllers/upload.controller';
import * as files from '../controllers/files.contoller';

const router = express.Router();
const db = new Database(process.env.MONGODB_URI, process.env.MONGODB_URI);

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 3001})

wss.on('connection', (ws) => {
  console.log('[socket] connection detected');
  ws.send('[socket] connected to server')
  ws.on('message', (data) => {
    console.log(data);
  });
});

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'))
})

router.post('/upload', db.upload.single('file'), (req, res) => upload.upload(req, res, wss))

router.get('/files', (req, res) => files.getFiles(req, res, db))
router.get('/files/:filename', (req, res) => files.getContent(req, res, db))
router.post('/files/deletepath', (req, res) => files.deleteFileByPath(req, res, db, wss))
router.post('/files/:filename', (req, res) => files.getFile(req, res, db))
router.delete('/files/:filename', (req, res) => files.deleteFile(req, res, db))

export default router;
