const userService = require("../service/userService");

let userCtrl = {
	checkLoginInfo: function (req, res, next) {

	},

	login: function (req, res, next) {
		console.log(req.body);
		let {
				username,
				password
			} = req.body;

		userService.login(username, password).then(success=>{
			if (!success) {
				res.json({
					success: false,
					error: {
						code: 100001,
						message: "Incorrect username or password",
					}
				});
				return;
			}

			// todo user session set

			res.json({
				success: true,
			});
		}).catch(err=>{
			res.json({
				success: false,
				error: {
					code: err.code,
					message: err.stack,
				}
			});
		});
	},

	logout: function (req, res) {
		req.session.destroy(err=>{
			if (err) {
				res.json({
					success: false,
					error: {
						code: err.code,
						message: err.stack,
					}
				});
			} else {
				res.json({
					success: true
				});
			}
		});
	}
};

module.exports = userCtrl;