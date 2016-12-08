const database       = require("../model/database");
const pictureModel   = require("../model/picture");
const directoryModel = require("../model/directory");
const fileService    = require("./fileService");

module.exports = {
	isDirExistByUserAndId: function (user, id) {
		return database.executeTemplate(conn=>{
			return directoryModel.isExistByUserAndId(conn, user, id);
		});
	},

	isDirExistByUserAndName: function (user, name, pDir) {
		return database.executeTemplate(conn=>{
			let p = null;

			if (!pDir) {
				p = directoryModel.isRootDirExistByUserAndName(conn, user, name);
			} else {
				p = directoryModel.isSubDirExistByUserAndName(conn, user, name, pDir);
			}
			
			return p;
		}); 
	},

	getDirs: function (user, parentDir, start, number) {
		return database.executeTemplate(conn=>{
			let p = null;

			if (parentDir == null) {
				p = directoryModel.getUserRootDirs(conn, user, start, number);
			} else {
				p = directoryModel.getUserSubDirs(conn, user, parentDir, start, number);
			}

			return p;
		});
	},

	getNumberOfDirs: function (user, parentDir) {
		return database.executeTemplate(conn=>{
			let p = null;

			if (parentDir == null) {
				p = directoryModel.getNumberOfUserRootDirs(conn, user);
			} else {
				p = directoryModel.getNumberOfUserSubDirs(conn, user, parentDir);
			}

			return p;
		});
	},

	getDirsByUserAndIds: function (user, ids) {
		return database.executeTemplate(conn=>{
			return directoryModel.getDirsByUserAndIds(conn, user, ids);
		});	
	},

	getDirByUserAndId: function (user, id) {
		return database.executeTemplate(conn=>{
			return directoryModel.getDirByUserAndId(conn, user, id);
		});
	},

	addDir: function (dir) {
		return database.executeTemplate(conn=>{
			return new Promise((resolve, reject)=>{
				directoryModel.add(conn, dir).then(directory=>{
					fileService.mkdir(dir.path).then(()=>{
						resolve(directory);
					}).catch(reject);
				}).catch(reject);
			});
		});
	},

	updateDir: function (dir) {
		return database.executeTemplate(conn=>{
			return directoryModel.update(conn, dir);
		});	
	},

	deleteDir: function (dir) {
		return database.executeTemplate(conn=>{
			return deleteDir(conn, dir);
		});	

		function deleteDir (conn, dir) {
			return new Promise((resolve, reject)=>{
				directoryModel.getAllSubDirs(conn, dir).then(dirs=>{
					let promises = [];

					if (dirs.length > 0) {
						for (let tmpDir of dirs) {
							let p = deleteDir(conn, tmpDir);
							promises.push(p);
						}
					}

					Promise.all(promises).then(()=>{
						return pictureModel.getAllPicturesUnderDir(conn, dir);
					})
					.then(pictures=>{
						return pictureModel.deletePictures(conn, pictures);
					})
					.then(()=>{
						directoryModel.delete(conn, dir)
								 .then(resolve)
								 .catch(reject);
					})
					.catch(reject);
					
				}).catch(reject);
			});
		}
	},
};