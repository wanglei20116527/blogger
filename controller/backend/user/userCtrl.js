const validation   = require("../../../utils/validation");
const imageService = require("../../../service/imageService");
const userService  = require("../../../service/userService");

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

	updatePhoto: function (req, res) {
		let {
			user
		} = req.session.user;

		user = Object.assign({}, user);

		let {
			image
		} = req.body;
		
		image = imageService.base64ToBuffer(image);

		userService.updatePhoto(user, image).then(photo=>{
			req.session.user.photo = photo;
			
			res.json({
				success: true,
				data: {
					image: photo
				}
			});

		}).catch(err=>{
			res.json({
				success: false,
				error: {
					code: 190000,
					message: err.stack
				}
			});
		});

		
	},
};