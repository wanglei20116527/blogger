const validation  = require("../../../utils/validation");
const userService = require("../../../service/userService");

module.exports = {
	getUser: function (req, res) {
		try {
			let {
				user
			} = req.session.user;

			let tUser = Object.assign({}, user);

			delete tUser.password;
			delete tUser.home;

			res.json({
				success: true,
				data: {
					user: tUser
				}
			});
		} catch (err) {
			res.json({
				success: false,
				error: {
					code: 190000,
					message: err.stack
				}
			});
		}
	},

	updateUser: function (req, res) {
		let {
			username,
			newPassword,
			oldPassword,
			email,
			phone,
			photo,
			about
		} = req.body;
	},
};