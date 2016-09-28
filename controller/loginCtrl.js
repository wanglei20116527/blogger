const config      = require("../config").backend;
const userService = require("../service/userService");
const hashService = require("../service/hashService");

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
								code: err.code,
								message: err.stack
							}
						});
					});
	},

	loginSuccess: function (req, res) {
		try {
			let remember = req.body.remember;
			let session  = req.session;
			let user     = req.body.user|| {};
			let token    = hashService.hash(`${user.name}-${user.password}-${Date.now()}`);

			session.user = {
				token: token,
				user: user
			};

			if (remember) {
				let maxAge = LOGIN_CONFIG.session.maxAge;

				res.cookie("_token", token, {
					httpOnly: false,
					maxAge: maxAge
				});

				session.maxAge = maxAge;
				session.cookie.maxAge = maxAge;
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
					code: err.code,
					message: err.stack
				}
			})
		}
	}
};