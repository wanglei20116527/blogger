const database       = require("../model/database");
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

	getDirs: function (user, parentDir) {
		return database.executeTemplate(conn=>{
			let p = null;

			if (!parentDir) {
				p = directoryModel.getUserSubDirs(conn, user, parentDir);
			} else {
				p = directoryModel.getUserRootDirs(conn, user);
			}

			return p;
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

			return Promise.all(promises);
		});
	},

	updateDir: function (dir) {
		return database.executeTemplate(conn=>{
			return directoryModel.update(conn, dir);
		});	
	},

	deleteDir: function (dir) {
		return database.executeTemplate(conn=>{
			return directoryModel.delete(conn, dir);
		});	
	},
};