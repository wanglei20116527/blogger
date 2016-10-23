const underscore  = require("underscore");
const config      = require("../../../config").backend;
const userService = require("../../../service/userService");
const hashService = require("../../../service/hashService");

const DEFAULT_LOGIN = {
	failCount: 0,
};

const LOGIN_CONFIG = config.login;

module.exports = {
	checkCaptcha: function (req, res, next) {
		let {
			captcha
		} = req.body;

		let session = req.session;
		let login   = session.login = session.login || DEFAULT_LOGIN;

		if (login.failCount <= 3 
				|| session.captcha != null && session.captcha === captcha) {
			next();
			return;
		}

		session.captcha = null;
		login.failCount++;

		res.json({
			success: false,
			error: {
				code: 100001,
				message: "Incorrect captcha"
			}
		});
	},

	checkNameAndPassword: function (req, res, next) {
		let {
			username,
			password
		} = req.body;

		let session = req.session;
		let login   = session.login = session.login || DEFAULT_LOGIN;

		userService .getUserByNameAndPassword(username, password)
					.then(user=>{
						if (user == null) {
							session.captcha = null;
							login.failCount++;

							res.json({
								success: false,
								error: {
									code: 100002,
									message: "Incorrect username or password"
								}
							});
							return;
						}

						req.body.user = user;

						next();
					})
					.catch(err=>{
						res.json({
							success: false,
							error: {
								code: 190000,
								message: err.stack
							}
						});
					});
	},

	loginSuccess: function (req, res) {
		try {
			let {
				remember = false,
				user = {}
			} = req.body;

			if (!underscore.isBoolean(remember)) {
				remember = false;
			}

			let session  = req.session;
			let token    = hashService.hash(`${user.name}-${user.password}-${Date.now()}`);

			session.user = {
				token: token,
				user: user
			};

			if (remember) {
				// set cookie lifetime to 10 days
				let maxAge = LOGIN_CONFIG.session.maxAge;

				res.cookie("_token", token, {
					httpOnly: true,
					maxAge: maxAge
				});

				session.maxAge = maxAge;
				session.cookie.maxAge = maxAge;
			} else {
				// set cookie lifetime to session
				res.cookie("_token", token, {
					httpOnly: true,
				});
			}		

			session.captcha = null;
			session.login   = null;

			res.json({
				success: true
			});

		} catch (err) {
			res.json({
				success: false,
				error: {
					code: 190000,
					message: err.stack
				}
			})
		}
	}
};