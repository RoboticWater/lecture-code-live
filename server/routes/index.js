import express from 'express';

import Database from '../models/db';

import * as upload from '../controllers/upload.controller';
import * as files from '../controllers/files.contoller';

const router = express.Router();
const db = new Database('mongodb://localhost:27017/lecturecode', 'mongodb://localhost:27017/lecturecode');

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510})

wss.on('connection', (ws) => {
  console.log('[socket] connection detected');
  ws.send('[socket] connected to server')
  ws.on('message', (data) => {
    console.log(data);
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', db.upload.single('file'), (req, res) => upload.upload(req, res, wss))

router.get('/files', (req, res) => files.getFiles(req, res, db))
router.get('/files/:filename', (req, res) => files.getContent(req, res, db))
router.post('/files/deletepath', (req, res) => files.deleteFileByPath(req, res, db, wss))
router.post('/files/:filename', (req, res) => files.getFile(req, res, db))
router.delete('/files/:filename', (req, res) => files.deleteFile(req, res, db))

export default router;
