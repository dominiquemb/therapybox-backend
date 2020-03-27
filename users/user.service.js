const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool, Client } = require('pg')


const pool = new Pool({
	  user: 'postgres',
	  host: 'localhost',
	  database: 'hackathon',
	  password: 'icecream2020',
	  port: 5432,
});

// users hardcoded for simplicity, store in a db for production applications
// const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];

module.exports = {
    authenticate,
    register,
    getAll
};

async function authenticate({ username, password }) {
//    const user = users.find(u => u.username === username && u.password === password);

//	const text = 'SELECT * FROM users WHERE username = $1 AND password = $2';
	const text = 'SELECT * FROM users WHERE username = $1';
	const values = [username];
	let user = false;

	try {
		const queryResult = await pool.query(text, values);
		user = queryResult.rows[0];
	} catch (err) {
		console.log(err);
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
	    /*
    if (user) {
	const token = jwt.sign({ sub: user.id }, new Buffer(config.secret, 'base64'), { expiresIn: "7d" });
        const { password, ...userWithoutPassword } = user;
        return {
		...userWithoutPassword,
		token
	};
    }
    */
}

async function register({ first_name, last_name, username, password, email }) {
	console.log(first_name);
	console.log(last_name);
	console.log(username);
	console.log(password);
	console.log(email);
	const text = 'INSERT INTO users(first_name, last_name, username, password, email) VALUES($1, $2, $3, $4, $5) RETURNING *'
	const hash = bcrypt.hashSync(password, 10);
	const values = [first_name, last_name, username, hash, email];
	let result = {}; 

	try {
		const queryResult = await pool.query(text, values);
		result = queryResult.rows[0];
		console.log('successful result');
		console.log(result);
	} catch (err) {
		console.log(err);
		result = false;
	}

	return result;
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}
