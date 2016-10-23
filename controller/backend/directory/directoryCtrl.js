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
			parentDirectory: pDirId
		} = req.query;

		if (pDirId != null && !Number.isInteger(pDirId)) {
			res.json({
				success: false,
				error: {
					code: 190500,
					message: `parent dir id invalid`
				}
			});
			return;
		}

		let p = Promise.resolve(true);
		if (pDirId != null) {
			pDirId = parseInt(pDirId);
			p = isDirExistByUserAndId(user, pDirId);
		}

		p.then(isExist=>{
			if (!isExist) {
				res.json({
					success: false,
					error: {
						code: 190500,
						message: `parent dir not exist`
					}
				});
				return;
			}

			let pDir = pDirId == null ? null: {
				id: pDirId
			};

			dirService.getDirs(user, pDir).then(dirs=>{
				res.json({
					success: true,
					data: {
						directories: dirs || []
					}
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
					res.json({
						success: false,
						error: {
							code: 190501,
							message: `directory ${dir.name} already exist`
						}
					});
					return;
				}

				dirService.addDir(dir).then(directory=>{
					res.json({
						success: true,
						data: {
							directory: directory
						}
					});
				}).catch(err=>{
					console.error(err);
					res.sendStatus(500);
				});

			}).catch(err=>{
				console.error(err);
				res.status(err.code || 500).send(err.message)
			})
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
		// todo delete directory recursion (directoryService need to fixed)

		let {
			user
		} = req.session.user;

		let {
			directory: dirId
		} = req.query;

		dirId = parseInt(dirId, 10);

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
				res.json({
					success: false,
					error: {
						code: 190503,
						message: `directory not exist`
					}
				});
				return;
			}

			let directory = {
				id: dirId,
				user: user.id
			};

			dirService.deleteDir(directory).then(()=>{
				res.json({
					success: true,
					data: {
						directory: directory
					}
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
};

function filterDirectory (dir) {
	dir = Object.assign({}, dir);
	delete dir.path;

	return dir;
}