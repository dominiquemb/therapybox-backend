const jwt = require('jsonwebtoken');
const userService = require('../users/user.service');
const config = require('config.json');

module.exports = basicAuth;

async function basicAuth(req, res, next) {
    // make authenticate path public
    if (req.path === '/users/authenticate' || req.path === '/users/register') {
        return next();
    }

    // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    // const base64Credentials =  req.headers.authorization.split(' ')[1];
    // const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    // const [username, password] = credentials.split(':');
    // const user = await userService.authenticate({ username, password });
    try {
	    const token = req.headers.authorization.split(' ')[1];
	    let user = false;
	    await jwt.verify(token, new Buffer(config.secret, 'base64'), function(err, decoded) {
		if (err && !decoded) {
			throw err;
		}
		user = decoded;
	    });

	    // attach user to request object
	    req.user = user

	    next();
    } catch(err) {
	return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }
}
