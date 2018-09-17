import express from'express';
import bodyParser from'body-parser';
import methodOverride from'method-override';
import WebSocket from 'ws';
import util from 'util';
import mongoose from 'mongoose';
import path from 'path';

import routesApi from './routes';

const app = express();
app.use(express.static(path.join(__dirname, '/../client/build')))

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use('/api', routesApi);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'))
})

export default app;
