module.exports = function (req, res, next) {
	let session = req.session  || {};
	let user    = session.user || {};
	let token   = user.token;

	if (token && req.cookies._token && token === req.cookies._token) {
		next();
		return;
	}

	res.sendStatus(403);
};