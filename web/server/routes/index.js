import express from 'express';

import users from '../controllers/users.controller';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/users', users.getUsers)
router.post('/users', users.createUser)

// router.get('/files', files.getFiles)
// router.get('/files/:id', files.getFileByID)
// router.post('/files', files.uploadFile)

module.exports = router;
