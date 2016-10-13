const path      = require("path");
const file      = require("./fileService");
const database  = require("../model/database");
const userModel = require("../model/user");

let userService = {
	getUserByNameAndPassword: function (name, password) {
		return database.executeTemplate(conn=>{
			return new Promise((resolve, reject)=>{
				userModel
					.getUserByNameAndPassword(conn, name, password)
					.then(resolve)
					.catch(reject);
			});		
		});
	},

	updatePhoto: function (user, photoBuffer) {
		var photoPath = path.join(process.cwd(), "public/photo", user.name, "avatar.png");
		var photoUrl  = path.join("/static/photo", user.name, "avatar.png");

		user = Object.assign({}, user);
		user.photo = photoUrl;

		return new Promise((resolve, reject)=>{
			database.executeTemplate(conn=>{
				let promises = [];
				let p = null;

				p = userModel.update(conn, user);
				promises.push(p);

				p = file.writeFile(photoPath, photoBuffer);
				promises.push(p);

				return Promise.all(promises);
			}).then(()=>{
				resolve(photoUrl);
			}).catch(reject);
		});
	}	
};

module.exports = userService;