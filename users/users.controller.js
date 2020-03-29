const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const formidable = require('formidable');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/:id', getUser);
router.post('/:id/images', addImages);
router.get('/:id/images', getImages);
router.post('/:id/tasks', setTasks);
router.get('/:id/tasks', getTasks);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
	let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
	  	let merged = { ...fields, images: { ...files } };
		userService.register(merged)
			.then(user => {
			if (user) {
				console.log('user');
				console.log(user);
				res.json(user);
			} else {
				res.status(400).json({ message: 'Unable to create new user' })
			}
		})
			.catch(err => next(err));
    });
}

function getImages(req, res, next) {
	const { params } = req;
	const { id } = params;
	userService.getImages(id)
		.then(images => res.json(images))
		.catch(err => next(err));
}

function getTasks(req, res, next) {
	const { params } = req;
	const { id } = params;
	userService.getTasks(id)
		.then(tasks => res.json(tasks))
		.catch(err => next(err));
}

function addImages(req, res, next) {
	let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
	  	let merged = { ...fields, images: { ...files } };
		userService.addImages(merged)
			.then(success => {
			if (success) {
				console.log('added images');
				console.log(success);
				res.json(success);
			} else {
				res.status(400).json({ message: 'Unable to add images' })
			}
		})
			.catch(err => next(err));
    });
}

function setTasks(req, res, next) {
	userService.setTasks(req.body)
		.then(success => {
		if (success) {
			console.log('added tasks');
			console.log(success);
			res.json(success);
		} else {
			res.status(400).json({ message: 'Unable to add tasks' })
		}
	})
	.catch(err => next(err));
}

function getUser(req, res, next) {
	const { params } = req;
	const { id } = params;
	userService.getUser(id)
		.then(users => res.json(users))
		.catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}
