const database  = require("./database");

const TABLENAME = "picture";
const FIELDS = [
	"id",
	"name", 
	"path",
	"user",
	"directory"
];

class Picture {

	constructor (picture) {
		for (let field of FIELDS) {
			this[field] = field in picture ? picture[field] : null;
		}
	}

	static add (connection, picture) {
		return database.insert(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Picture(picture)]
					);
	}

	static update (connection, picture) {
		return new Promise((resolve, reject)=>{
			if (picture.id == null) {
				reject(new Error(`picture id can not be ${picture.id}`));
				return;
			}

			database.update(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Picture(picture)]
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static delete (connection, picture) {
		return new Promise((resolve, reject)=>{
			if (picture.id == null) {
				reject(new Error(`picture id can not be ${picture.id}`));
				return;
			}

			database.delete(
						connection, 
						TABLENAME, 
						[new Picture(picture)]
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static getUserPicturesUnderDirectory (connection, user, directory) {
		return new Promise((resolve, reject)=>{
			if (user.id == null) {
				reject(new Error(`user id can not be ${user.id}`));
				return;
			}

			if (directory.id == null) {
				reject(new Error(`directory id can not be ${directory.id}`));
				return;
			}

			let sql = `select * from ${TABLENAME}
								where user=? and directory=? and deleteTime is null`;
			let params = [user.id, directory.id];

			database.execute(
							connection, 
							sql, 
							params
							)
					.then(pictures=>{
						let ret = [];

						for (let picture of pictures) {
							picture = new Picture(picture);
							ret.push(picture);
						}

						resolve(ret);
					})
					.catch(reject);
		});
	}
}

module.exports = Picture;