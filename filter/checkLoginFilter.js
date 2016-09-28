module.exports = function (req, res, next) {
	let {
		token
	} = req.session.user;

	if (token === req.cookies._token) {
		next();
		return;
	}

	res.josn({
		success: false,
		error: {
			code: 110001,
			message: "access deny, haven't login"  
		}
	});
};