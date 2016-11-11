const path        = require("path");
const underscore  = require("underscore");
const uuid        = require("../../../utils/uuid");
const validation  = require("../../../utils/validation");
const hashService = require("../../../service/hashService");
const dirService  = require("../../../service/directoryService");

const BASE_PATH   = path.join(process.cwd(), "/public/picture");

module.exports = {
	getDirectoies: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			parentDirectory: oPDirId
		} = req.query;

		let pDirId = null;

		if (oPDirId != null) {
			pDirId = parseInt(oPDirId, 10);
		}

		if (pDirId != null && !Number.isInteger(pDirId)) {
			res.json({
				success: false,
				error: {
					code: 190500,
					message: `parent dir id ${oPDirId} invalid`
				}
			});
			return;
		}

		let p = Promise.resolve(true);
		if (pDirId != null) {
			p = dirService.isDirExistByUserAndId(user, pDirId);
		}

		p.then(isExist=>{
			if (!isExist) {
				let err = new Error(`parent dir not exist`);
				err.code = 190500;
				throw err;
			}

			let pDir = pDirId == null ? null: {
				id: pDirId
			};

			return dirService.getDirs(user, pDir);
		})
		.then(dirs=>{
			dirs = dirs || [];

			for (let dir of dirs) {
				delete dir.path;
			}

			res.json({
				success: true,
				data: {
					directories: dirs
				}
			});
		})
		.catch(err=>{
			console.error(err);

			if (err.code) {
				res.json({
					success: false,
					error: {
						code: err.code,
						message: err.message || err.stack	
					}
				});
				return;
			}

			res.sendStatus(err.statusCode || 500);
		});
	},

	getDirectoriesByIds: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			ids
		} = req.params;

		ids = ids.split(" ");

		try {
			for (let i = 0, len = ids.length; i < len; ++i) {
				let id = parseInt(ids[i], 10);
				
				if (!Number.isInteger(id)) {
					let err = new Error(`input param ids invalid`);
					err.code = 190500;
					throw err;
				}

				ids[i] = id;
			}

		} catch (err) {
			res.json({
				success: false,
				error: {
					code: err.code,
					message: err.message || err.stack
				}
			});
			return;
		}

		dirService.getDirsByUserAndIds(user, ids).then(dirs=>{
			for (let i = 0, len = dirs.length; i < len; ++i) {
				dirs[i] = filterDirectory(dirs[i]);
			}

			res.json({
				success: true,
				data: {
					directories: dirs
				}
			});
		})
		.catch(err=>{
			console.error(err);

			if (err.code) {
				res.json({
					success: false,
					error: {
						code: err.code,
						message: err.message || err.stack	
					}
				});
				return;
			}

			res.sendStatus(err.statusCode || 500);
		});
	},

	addDirectory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			directory,
			parentDirectory,
		} = req.body;

		if (!underscore.isObject(directory)
			|| !underscore.isString(directory.name)
			|| !validation.checkDirName(directory.name.trim())
			|| (underscore.isObject(parentDirectory) 
				&& !Number.isInteger(parentDirectory.id))) {
			res.json({
				success: false,
				error: {
					code: 190500,
					message: `input arguments invalid`
				}
			});
			return;
		}
	
		if (parentDirectory) {
			dirService.getDirByUserAndId(user, parentDirectory.id).then(pDir=>{
				if (pDir == null) {
					res.json({
						success: false,
						error: {
							code: 190501,
							message: `parent directory not exist`
						}
					});
					return;
				}

				addDir(directory, pDir);
			}).catch(err=>{
				console.error(err);
				res.sendStatus(500);
			});

		} else {
			addDir(directory);
		}

		function addDir (dir, pDir) {
			directory.user = user.id;
			directory.name = directory.name.trim();

			let dirName = hashService.hash(dir.name + Date.now()) + uuid();
			if (pDir) {
				dir.parentDirectory = pDir.id;
				dir.path = path.join(pDir.path, dirName);

			} else {
				dir.parentDirectory = null;
				directory.path = path.join(BASE_PATH, user.name, dirName);
			}

			dirService.isDirExistByUserAndName(user, dir.name, pDir).then(isExist=>{
				if (isExist) {
					let err = new Error(`directory ${dir.name} already exist`);
					err.code = 190501;
					throw err;
				}

				return dirService.addDir(dir);
			})
			.then(dir=>{
				dir = Object.assign({}, dir || {});
				
				delete dir.path;
				
				res.json({
					success: true,
					data: {
						directory: dir
					}
				});
			})
			.catch(err=>{
				console.error(err);

				if (err.code) {
					res.json({
						success: false,
						error: {
							code: err.code,
							message: err.message || err.stack	
						}
					});
					return;
				}

				res.sendStatus(err.statusCode || 500);
			});
		}
	},

	updateDirectory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			directory
		} = req.body;

		if (!underscore.isObject(directory)
			|| !Number.isInteger(directory.id)
			|| !underscore.isString(directory.name)
			|| !validation.checkDirName(directory.name.trim())
			|| (!!directory.parentDirectory && !Number.isInteger(directory.parentDirectory)) ) {
			res.json({
				success: false,
				error: {
					code: 190500,
					message: `input arguments invalid`
				}
			});
			return;
		}

		dirService.getDirByUserAndId(user, directory.id).then(dir=>{
			if (dir == null) {
				res.json({
					success: false,
					error: {
						code: 190502,
						message: `directory not exist`
					}
				});
				return;
			}

			directory.user = user.id;
			directory.name = directory.name.trim();
			directory.path = dir.path;

			dirService.isDirExistByUserAndName(user, directory.name).then(isExist=>{
				if (isExist) {
					res.json({
						success: false,
						error: {
							code: 190501,
							message: `directory ${directory.name} already exist`
						}
					});
					return;
				}

				dirService.updateDir(directory).then(()=>{
					res.json({
						success: true,
						data: {
							directory: directory
						}
					});
					return;	
				}).catch(err=>{
					console.error(err);
					res.sendStatus(500);	
				});
			}).catch(err=>{
				console.error(err);
				res.sendStatus(500);
			});

		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	deleteDirectory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			directory: dirId
		} = req.query;

		try {
			dirId = parseInt(dirId, 10);
		} catch (err) {
			res.json({
				success: false,
				error: {
					code: 190502,
					message: err.message || err.stack
				}
			});
		}

		if (!Number.isInteger(dirId)) {
			res.json({
				success: false,
				error: {
					code: 190502,
					message: `directory id can't be ${dirId}`
				}
			});
			return;
		}

		dirService.isDirExistByUserAndId(user, dirId).then(isExist=>{
			if (!isExist) {
				let err = new Error(`directory not exist`);
				err.code = 190503;
				throw err;
			}

			let directory = {
				id: dirId,
				user: user.id
			};

			return dirService.deleteDir(directory);
		})
		.then(()=>{
			res.json({
				success: true
			});
		})
		.catch(err=>{
			console.error(err);

			if (err.statusCode) {
				res.sendStatus(err.statusCode);
				return;
			}

			if (err.code) {
				res.json({
					success: false,
					error: {
						code: err.code,
						message: err.message || err.stack	
					}
				});
				return;
			}
		});
	},
};

function filterDirectory (dir) {
	if (dir == null) {
		return null;
	}

	dir = Object.assign({}, dir);
	
	delete dir.path;

	return dir;
}