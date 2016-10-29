const path           = require("path");
const Busboy         = require("busboy");
const underscore     = require("underscore");
const uuid           = require("../../../utils/uuid");
const validation     = require("../../../utils/validation");
const hashService    = require("../../../service/hashService");
const dirService     = require("../../../service/directoryService");
const fileService    = require("../../../service/fileService");
const pictureService = require("../../../service/pictureService");

const TMP_DIR   = path.join(process.cwd(), "tmp/picture");
const MAX_SIZE  = 2 * 1024 * 1024;

module.exports = {
	startUploadPictureSegment: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			picture,
			directory
		} = req.body;

		if (!underscore.isObject(picture)
			|| !underscore.isString(picture.name)
			|| !validation.checkPictureName(picture.name)) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `picture invalid`
				}
			});
			return;
		}

		if (!underscore.isObject(directory)
			|| !Number.isInteger(directory.id)) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `directory invalid`
				}
			});
		}

		let picSegment = null;

		dirService.getDirByUserAndId(user, directory.id).then(dir=>{
			if (!dir) {
				let err = new Error(`directory not exist`);
				err.code = 160000;
				throw err;
			}

			directory = dir;

			return pictureService.isPicExistByUserAndNameAndDir(user, picture.name, dir);
		})
		.then(isExist=>{
			if (isExist) {
				let err = new Error(`picture name already exist`);
				err.code = 160000;
				throw err;
			}

			let picId   = hashService.hash(`${user.id}-${picture.name}-${Date.now()}`) + uuid();
			let picPath = path.join(TMP_DIR, picId);

			picSegment = {
				id: picId,
				path: picPath,
				name: picture.name,
				directory: directory,
				acceptedBytes: 0, // current accept file size
			};

			return fileService.mkFile(picPath);
		})
		.then(()=>{
			let pics = req.session.pictures || [];

			pics.push(picSegment);

			req.session.pictures = pics;

			res.json({
				success: true,
				data: {
					id: picSegment.id
				}
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

	uploadPictureSegment: function (req, res) {
		let {
			pictures = []
		} = req.session;

		let {
			pictureId
		} = req.body;

		let picture = null;

		for (let pic of pictures) {
			if (pic.id === pictureId) {
				picture = pic;
				break;
			}
		}

		if (picture === null) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `picture id ${pictureId} invalid`
				}
			});
			return;
		}

		let {
			file
		} = req;

		if (!file) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `no picture submit`
				}
			});
			return;
		}

		fileService.readFile(file.path).then(data=>{
			return fileService.appendFile(picture.path, data);
		})
		.then(()=>{
			return fileService.unlink(file.path);
		})
		.then(()=>{
			picture.acceptedBytes += file.size;

			let tmpPic = Object.assign({}, picture || {});
			delete tmpPic.path;
			delete tmpPic.directory;

			res.json({
				success: true,
				data: {
					picture: tmpPic
				}
			});
		})
		.catch(err=>{
			console.error(err);

			if (file) {
				fileService.unlink(file.path).catch(err=>{
					console.error(err);
				});
			}

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

	finishUploadPictureSegment: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			pictures = []
		} = req.session;

		let {
			pictureId
		} = req.body;

		let picture = null;

		for (let i = 0, len = pictures.length; i < len; ++i) {
			let pic = pictures[i];
			if (pic.id === pictureId) {
				picture  = pictures[i];
				pictures.splice(i, i + 1);
				break;
			}
		}

		if (picture == null) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `picture ${pictureId} not exist`
				}
			});
			return;
		}

		let {
			path,
			name,
			directory
		} = picture;

		let addedPic = null;

		pictureService.addPicture(user, path, name, directory).then(pic=>{
			addedPic = pic;

			return fileService.unlink(path);
		})
		.then(()=>{
			delete addedPic.path;

			res.json({
				success: true,
				data: {
					picture: addedPic
				}
			});

			req.session.pictures = pictures;
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

	abortUploadPictureSegment: function (req, res) {
		let {
			pictures = []
		} = req.session;

		let {
			pictureId
		} = req.body;

		let picture = null;
		
		for (let i = 0, len = pictures.length; i < len; ++i) {
			let pic = pictures[i];
			if (pic.id === pictureId) {
				picture  = pictures[i];
				pictures.splice(i, i + 1);
				break;
			}
		}

		if (picture == null) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `picture ${pictureId} not exist`
				}
			});
			return;
		}

		fileService.unlink(picture.path).then(()=>{
			res.json({
				success: true
			});
		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});

		req.session.pictures = pictures;
	},

	uploadPicture: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			file
		} = req;

		let {
			directory: oDirId
		} = req.body;

		let dirId = oDirId, directory;

		if (!file) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `no picture submit`
				}
			});
			return;
		}

		if (!validation.checkPictureMimeType(file.mimetype)) {
			if (file) {
				fileService.unlink(file.path).catch(err=>{
					console.error(err);
				});
			}

			res.json({
				success: false,
				error: {
					code: 160000,
					message: `upload type invalid`
				}
			});
			return;	
		}

		try {
			dirId = parseInt(dirId, 10);
		} catch (err) {
			if (file) {
				fileService.unlink(file.path).catch(err=>{
					console.error(err);
				});
			}

			res.json({
				success: false,
				error: {
					code: 160000,
					message: `directory id ${oDirId} invalid`
				}
			});
			return;
		}

		if (!Number.isInteger(dirId)) {
			if (file) {
				fileService.unlink(file.path).catch(err=>{
					console.error(err);
				});
			}
			
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `directory id ${oDirId} invalid`
				}
			});
			return;
		}

		dirService.getDirByUserAndId(user, dirId).then(dir=>{
			if (!dir) {
				let err = new Error(`directory not exist`);
				err.code = 160000;
				throw err;
			}

			directory = dir;

			let name = file.originalname;

			return pictureService.isPicExistByUserAndNameAndDir(user, name, directory);
		})
		.then(isExist=>{
			let {
				path,
				originalname: name
			} = file;

			if (isExist) {
				let err = new Error(`picture ${name} already exist`);
				err.code = 160000;
				throw err;
			}

			return pictureService.addPicture(user, path, name, directory);
		})
		.then(pic=>{
			if (file) {
				fileService.unlink(file.path).catch(err=>{
					console.error(err);
				});
			}

			delete pic.path;

			res.json({
				success: true,
				data: {
					picture: pic
				}
			});
		})
		.catch(err=>{
			console.error(err);
			if (file) {
				fileService.unlink(file.path).catch(err=>{
					console.error(err);
				});
			}

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

	getPicturesUnderDir: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			directory: dirId
		} = req.params;

		try {
			dirId = parseInt(dirId, 10);

		} catch (err) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `directory id ${dirId} invalid`
				}
			});
			return;
		}

		if (!Number.isInteger(dirId)) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `directory id ${dirId} invalid`
				}
			});
			return;
		}

		dirService.getDirByUserAndId(user, dirId).then(dir=>{
			if (!dir) {
				let err = new Error(`directory not exist`);
				err.code = 160000;
				throw err;
			}

			return pictureService.getPicturesByUserAndDir(user, dir);
		})
		.then(pics=>{
			pics = pics || [];
			
			for (let pic of pics) {
				delete pic.path;
			}

			res.json({
				success: true,
				data: {
					pictures: pics
				}
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

	updatePicture: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			picture = {}
		} = req.body;

		if (!Number.isInteger(picture.id)
			|| !Number.isInteger(picture.directory)
			|| !underscore.isString(picture.name)
			|| !validation.checkPictureName(picture.name)) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `input picture invalid`
				}
			});
			return;
		}

		dirService.getDirByUserAndId(user, picture.directory).then(dir=>{
			if (!dir) {
				let err = new Error(`directory not exist`);
				err.code = 160000;
				throw err;
			}

			return pictureService.getPictureByUserAndId(user, picture.id);
		})
		.then(pic=>{
			if (!pic) {
				let err = new Error(`picture not exist`);
				err.code = 160000;
				throw err;
			}

			picture = Object.assign({}, pic, picture);

			return pictureService.updatePicture(picture);
		})
		.then(()=>{
			res.json({
				success: true,
				data: {
					picture: picture
				}
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

	deletePicture: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			picture: oPicId
		} = req.params;

		let picId = oPicId;
		
		try {
			picId = parseInt(picId, 10);

		} catch (err) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `picture id ${oPicId} invalid`
				}
			});
			return;
		}

		if (!Number.isInteger(picId)) {
			res.json({
				success: false,
				error: {
					code: 160000,
					message: `picture id ${oPicId} invalid`
				}
			});
			return;
		}

		pictureService.getPictureByUserAndId(user, picId).then(pic=>{
			if (pic == null) {
				let err = new Error(`picture not exist`);
				err.code = 160000;
				throw err;
			}

			return pictureService.deletePicture(pic);
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