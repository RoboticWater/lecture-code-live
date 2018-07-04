import React from 'react';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';

import router = './routes/routes.js'

app.set('views', path.join(__dirname, '../client'));
app.use(express.static(path.join(__dirname, '../client')));
app.use('/', router);
module.exports=app;