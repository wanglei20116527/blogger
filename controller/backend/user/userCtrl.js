const underscore   = require("underscore");
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
			console.error(err);
			res.sendStatus(500);
		}
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
			console.error(err);
			res.sendStatus(500);
		});
	},

	updatePassword: function (req, res) {
		let user = {
			user
		} = req.session.user;

		let tUser = Object.assign({}, user || {});

		let {
			oPassword,
			nPassword,
			cPassword 
		} = req.body;

		if (!underscore.isString(oPassword)
			|| !underscore.isString(nPassword)
			|| !underscore.isString(cPassword)) {
			res.json({
				success: false,
				error: {
					code: 120100,
					message: "input parameter invalid",
				}
			});
			return;
		}

		if (oPassword !== user.password) {
			res.json({
				success: false,
				error: {
					code: 120101,
					message: "password not correct",
				}
			});
			return;
		}

		if (nPassword !== cPassword) {
			res.json({
				success: false,
				error: {
					code: 120102,
					message: "new password not same",
				}
			});
			return;
		}

		if (!validation.checkPassword(nPassword)) {
			res.json({
				success: false,
				error: {
					code: 120103,
					message: "password not valid",
				}
			});
			return;
		}

		tUser.password = nPassword;

		userService.updateUser(tUser).then(()=>{
			req.session.user.password = nPassword;

			res.json({
				success: true,
				data: {
					image: photo
				}
			});

		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	updateUser: function (req, res) {
		let {
			email = "",
			phone = "",
			about = ""
		} = req.body;

		if (!underscore.isString(email)
			|| !underscore.isString(photo)
			|| !underscore.isString(about)) {
			res.json({
				success: false,
				error: {
					code: 120104,
					message: "input parameter invalid",
				}
			});
		}

		email = email.trim();
		photo = photo.trim();
		about = about.trim();

		if (email !== "" && !validation.checkEmail(email)) {
			res.json({
				success: false,
				error: {
					code: 120105,
					message: "email not vaild",
				}
			});
			return;
		}

		if (phone !== "" && !validation.checkPhone(phone)) {
			res.json({
				success: false,
				error: {
					code: 120106,
					message: "phone not vaild",
				}
			});
			return;
		}

		let {
			user
		} = req.session.user;

		let tUser = Object.assign({}, user || {});
		
		tUser.email = email;
		tUser.phone = phone;
		tUser.about = about;

		userService.updateUser(tUser).then(()=>{
			req.session.user = tUser;

			res.json({
				success: true
			});
		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},
};