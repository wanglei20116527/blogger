const userService = require("../service/userService");
const hashService = require("../service/hashService");

const DEFAULT_LOGIN = {
	captcha: null,
	failCount: 0,
};

module.exports = {
	updateCaptcha: function (req, res) {
		try {
			let {
				text,
				buffer
			} = captchaService.getNewCaptcha();

			let login = req.session.login = req.session.login || DEFAULT_LOGIN;

			login.captcha = text;
			
			res.end(buffer);
			
		} catch (err) {
			res.json({
				success: false,
				error: {
					code: err.code,
					message: err.stack
				}
			});
		}
	},

	checkCaptcha: function (req, res, next) {
		let {
			captcha
		} = req.body;

		let login = req.session.login = req.session.login || DEFAULT_LOGIN;

		if (login.failCount <= 3 
				|| login.captcha != null && login.captcha === captcha) {
			next();
			return;
		}

		login.captcha = null;
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

		let login = req.session.login = req.session.login || DEFAULT_LOGIN;

		userService .getUserByNameAndPassword(username, password)
					.then(user=>{
						if (user == null) {
							login.captcha = null;
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

						req.login.user = user;

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
			let {
				remember
			} = req.body;

			let {
				user
			} = req.session.login;

			let token = hashService.hash(`${user.name}-${password}-${Date.now()}`);

			res.session.user = {
				token: token,
				user: user
			};

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