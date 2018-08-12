import express from'express';
import bodyParser from'body-parser';
import methodOverride from'method-override';
import WebSocket from 'ws';
import util from 'util';
import mongoose from 'mongoose'

import routesApi from './routes';

const app = express();

app.use(bodyParser.json());
app.use(methodOverride('_method'))
;app.use('/api', routesApi);

export default app;
