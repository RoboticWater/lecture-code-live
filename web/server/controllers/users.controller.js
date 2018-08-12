import express from 'express';
import mongoose from 'mongoose';

import response from './response';

const User = mongoose.model('User');

function getUsers(req, res, next) {
  User.find({}).exec((err, users) => {
  	if (err)
  		return res.send(err);
  	res.status(200).json(users);
  })
}

function createUser(req, res, next) {
	if (!req.body.name) {
		res.status(400).json({
			"message": response.postUserMissingNameBody
		});
	} else {
		let user = User();
		user.name = req.body.name
		user.save(err => {
			if (err)
				return res.send(err);
			res.status(200).json(user);
		});
	}
}

export default { getUsers, createUser };