import express from'express';
import bodyParser from'body-parser';
import path from'path';
import crypto from'crypto';
import mongoose from'mongoose';
import multer from'multer';
import GridFsStorage from'multer-gridfs-storage';
import Grid from'gridfs-stream';
import methodOverride from'method-override';
import md5 from 'md5';

import util from 'util';

const app = express();

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'jade');

const mongoURI = 'mongodb://localhost:27017/lecturecode';
const conn = mongoose.createConnection(mongoURI);
let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log("uploader up")
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    req.body.filepath,
    console.log("uploading:", req.body.filepath);
    let filename = md5(req.body.filepath) + path.extname(file.originalname);
    gfs.remove({filename: filename, root: 'uploads' }, (err, gridStore) => {
      if (err) return;
      console.log('removed old version');
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
const upload = multer({ storage });

// @route POST /upload
// @desc  Uploads file to DB
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/api/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/api/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

app.get('/api/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});


// @route GET /image/:filename
// @desc Display Image
app.get('/api/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/api/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/');
  });
});

const port = 5000;

// app.listen(port, () => console.log(`Server started on port ${port}`));
export default app;
