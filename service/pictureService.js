const path         = require("path");
const uuid         = require("../utils/uuid");
const database     = require("../model/database");
const pictureModel = require("../model/picture");
const hashService  = require("./hashService");
const fileService  = require("./fileService");

const BASE_URL = "/static";
const PREFIX_TO_REMOVE  = path.join(process.cwd(), "public");

module.exports = {
	isPicExistByUserAndNameAndDir: function (user, name, dir) {
		return database.executeTemplate(conn=>{
			return pictureModel.isPictureExistByUserAndNameAndDir(conn, user, name, dir);
		});
	},

	getPicturesByUserAndDir: function (user, dir) {
		return database.executeTemplate(conn=>{
			return pictureModel.getUserPicturesUnderDir(conn, user, dir);
		});
	},

	getPictureByUserAndId: function (user, id) {
		return database.executeTemplate(conn=>{
			return pictureModel.getPictureByUserAndId(conn, user, id);
		});
	},

	deletePicture: function (picture) {
		return database.executeTemplate(conn=>{
			return pictureModel.delete(conn, picture);
		});	
	},

	updatePicture: function (picture) {
		return database.executeTemplate(conn=>{
			return pictureModel.update(conn, picture);
		}); 
	},

	addPicture: function (user, srcPath, name, dir) {
		let extname = path.extname(name);
		let picPath = path.join(
							dir.path, 
							hashService.hash(`${user.id}-${Date.now()}-${name}`) + uuid() + extname);
		let url = path.join(BASE_URL, picPath.replace(PREFIX_TO_REMOVE, ""));

		let picture = {
			user: user.id,
			name: name,
			path: picPath,
			url : url,
			directory: dir.id
		};

		let rs = null;
		let ws = null;

		return database.executeTemplate(conn=>{
			return new Promise((resolve, reject)=>{
				let ps = [];
				let p  = null;

				p = pictureModel.add(conn, picture); 
				ps.push(p);

				p = new Promise((resolve, reject)=>{
					fileService.createReadStream(srcPath).then(rStream=>{
						rs = rStream;
						resolve(rs);
					}).catch(reject);
				});
				ps.push(p);

				p = new Promise((resolve, reject)=>{
					fileService.createWriteStream(picture.path).then(wStream=>{
						ws = wStream;
						resolve(ws);
					}).catch(reject);
				});
				ps.push(p);

				Promise.all(ps).then(args=>{
					let [
						pic,
						rs,
						ws
					] = args;
				
					rs.on("end", ()=>{
						resolve(pic);
					});

					rs.on("error", err=>{
						reject(err);
					});

					ws.on("error", err=>{
						reject(err);
					});

					rs.pipe(ws);
				}).catch(err=>{
					if (rs) {
						rs.resume();
					}

					if (ws) {
						ws.end();
					}

					reject(err);
				});
			});
		});
	}
};