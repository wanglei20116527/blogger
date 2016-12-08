const path         = require("path");
const uuid         = require("../utils/uuid");
const database     = require("../model/database");
const pictureModel = require("../model/picture");
const hashService  = require("./hashService");
const fileService  = require("./fileService");
const imageService = require("./imageService");

const BASE_URL = "/static";
const BASE_DIR = path.join(process.cwd(), "public/picture");
const PREFIX_TO_REMOVE  = path.join(process.cwd(), "public");

module.exports = {
	isPicExistByUserAndNameAndDir: function (user, name, dir) {
		return database.executeTemplate(conn=>{
			let promise = null;

			if (dir == null) {
				promise = pictureModel.isPictureExistByUserAndNameAndRootDir(conn, user, name);

			} else {
				promise = pictureModel.isPictureExistByUserAndNameAndDir(conn, user, name, dir);
			}

			return promise;
		});
	},

	getPicturesByUserAndDir: function (user, dir, start, number) {
		return database.executeTemplate(conn=>{
			let promise = null;

			if (dir == null) {
				promise = pictureModel.getPictruesByUserUnderRootDir(conn, user, start, number);

			} else {
				promise = pictureModel.getPicturesByUserUnderDir(conn, user, dir, start, number);
			}
			
			return promise;
		});
	},

	getNumberOfPicutesByUserUnderDir: function (user, dir) {
		return database.executeTemplate(conn=>{
			let promise = null;

			if (dir == null) {
				promise = pictureModel.getNumberOfPictruesByUserUnderRootDir(conn, user);

			} else {
				promise = pictureModel.getNumberOfPicturesByUserUnderDir(conn, user, dir);
			}
			
			return promise;
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

		let picName       = hashService.hash(`${user.id}-${Date.now()}-${name}`) + uuid() + extname;
		let thumbnailName = hashService.hash(`${user.id}-${Date.now()}-${name}`) + uuid() + extname;

		let baseDir = path.join(BASE_DIR, user.name);
		if (dir != null) {
			baseDir = dir.path; 
		}
		
		let picPath       = path.join(baseDir, picName);
		let thumbnailPath = path.join(baseDir, thumbnailName);

		let pathUrl      = path.join(BASE_URL, picPath.replace(PREFIX_TO_REMOVE, ""));
		let thumbnailUrl = path.join(BASE_URL, thumbnailPath.replace(PREFIX_TO_REMOVE, ""));

		let picture = {
			user: user.id,
			name: name,
			path: picPath,
			url : pathUrl,
			thumbnail: thumbnailUrl,
			thumbnailPath: thumbnailPath,
			date: Date.now(),
		};

		if (dir != null) {
			picture.directory = dir.id
		}

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

				p = imageService.mkThumbnail(srcPath, thumbnailPath);
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

					fileService.exists(picPath).then(isExist=>{
						if (!isExist) {
							return;
						}

						fileService.unlink(picPath).catch(reject);
					})
					.catch(reject);

					fileService.exists(thumbnailPath).then(isExist=>{
						if (!isExist) {
							return;
						}

						fileService.unlink(thumbnailPath).catch(reject);
					})
					.catch(reject);

					reject(err);
				});
			});
		});
	}
};