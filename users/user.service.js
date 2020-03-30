const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool, Client } = require('pg');
const moveFile = require('../_helpers/move-file');
const fs = require('fs');
const sharp = require('sharp');

const pool = new Pool({
	  user: 'postgres',
	  host: 'localhost',
	  database: 'hackathon',
	  password: 'icecream2020',
	  port: 5432,
});

module.exports = {
    authenticate,
	register,
	addImages,
	getImages,
	addTask,
	updateTask,
	getTasks,
	getAll,
	getUser
};

async function authenticate({ username, password }) {
	const text = 'SELECT * FROM users WHERE username = $1';
	const values = [username];
	let user = false;
	let error = false;

	try {
		const queryResult = await pool.query(text, values);
		user = queryResult.rows[0];
	} catch (err) {
		error = err;
		return err;
	}

	if (user) {
		if (bcrypt.compareSync(password, user.password)) {
			const token = jwt.sign({ sub: user.id }, new Buffer(config.secret, 'base64'), { expiresIn: "7d" });
			const { password, ...userWithoutPassword } = user;
			return {
				...userWithoutPassword,
				token
			};
		} else {
			return false;
		}
	}

	return false;
}

async function addImages({ id, images }) {
	let result = [];
	let error = false;
	for(let [indexname, image] of Object.entries(images)) {
		const index = indexname.split('').pop(); // get the number from the end of "file0", for example
		const { path, name } = image;
		const dir = `../therapybox-dashboard/public/assets/user_pics/${id}`;
		const frontend_path = `/assets/user_pics/${id}/${name}`;
		const fullnewpath = `../therapybox-dashboard/public/assets/user_pics/${id}/${name}`;
		const thumbpath = `../therapybox-dashboard/public/assets/user_pics/${id}/thumb_${name}`;
		const frontend_thumbpath = `/assets/user_pics/${id}/thumb_${name}`;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		sharp(path)
		.resize(80)
		.toFile(thumbpath);

		sharp(path)
			.resize(280)
			.toFile(fullnewpath, (err, info) => { 
				try {
					fs.unlinkSync(path);
				} catch (err) {
					// deletion failed
					console.log(err);
				}
			});

		const imageQuery = "INSERT INTO user_pics(user_id, pic, pic_index, pic_name, thumbnail) VALUES($1, $2, $3, $4, $5) RETURNING *";
		const imageValues = [id, frontend_path, index, name, frontend_thumbpath];

		try {
			const imageQueryResult = await pool.query(imageQuery, imageValues);
			result.push(imageQueryResult.rows[0]);
		} catch(err) {
			error = err;
		}
	}
	if (!result.length) {
		return error;
	}
	return result;
}

async function getImages(id) {
	const text = "SELECT * FROM user_pics WHERE user_id = $1";
	const values = [id];
	let result = {};

	try {
		const queryResult = await pool.query(text, values);
		result = queryResult.rows;
	} catch (err) {
		result = false;
	}

	return result;
}

async function updateTask({ id, task }) {
	let result = false;
	let error = false;
	const { description, completed, id: task_id } = task;
	const query = "UPDATE user_tasks SET description = $1, completed = $2 WHERE id = $3 AND user_id = $4";
	const values = [description, completed, task_id, id];

	try {
		const queryResult = await pool.query(query, values);
		result = queryResult;
	} catch(err) {
		error = err;
	}

	if (!result) {
		return error;
	}
	return result;
}

async function addTask({ id, task }) {
	let result = false;
	let error = false;
	const { description, completed } = task;
	const query = "INSERT INTO user_tasks(user_id, description, completed) VALUES($1, $2, $3) RETURNING *";
	const values = [id, description, completed];

	try {
		const queryResult = await pool.query(query, values);
		result = queryResult.rows[0];
	} catch(err) {
		error = err;
	}

	if (!result) {
		return error;
	}
	return result;
}

async function getTasks(id) {
	const text = "SELECT * FROM user_tasks WHERE user_id = $1";
	const values = [id];
	let result = {};

	try {
		const queryResult = await pool.query(text, values);
		result = queryResult.rows;

		console.log('successful result');
		console.log(result);
	} catch (err) {
		console.log(err);
		result = err;
	}

	return result;
}

async function register({ first_name, last_name, username, password, images, email }) {
	const text = 'INSERT INTO users(first_name, last_name, username, password, email) VALUES($1, $2, $3, $4, $5) RETURNING *';
	const hash = bcrypt.hashSync(password, 10);
	const values = [first_name, last_name, username, hash, email];
	let result = {}; 

	try {
		const queryResult = await pool.query(text, values);
		result = queryResult.rows[0];
		const { id } = result;
		if (id) {
			addImages({ id, images });
		}
	} catch (err) {
		result = false;
	}

	return result;
}

async function getUser(id) {
	const text = 'SELECT * FROM users WHERE id = $1 LIMIT 1';
	const values = [id];
	let result = {}; 

	try {
		const queryResult = await pool.query(text, values);
		result = queryResult.rows[0];
	} catch (err) {
		result = false;
	}

	const { password, ...userWithoutPassword } = result;
	return userWithoutPassword;
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}