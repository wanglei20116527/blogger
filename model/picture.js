const assert    = require("assert");
const database  = require("./database");

const TABLENAME = "picture";
const FIELDS = [
	"id",
	"name", 
	"path",
	"url",
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
		let fields = FIELDS.slice(1);

		return new Promise((resolve, reject)=>{
			database.insert(
						connection, 
						TABLENAME, 
						fields, 
						[new Picture(picture)]
					)
					.then(pictures=>{
						let picture = new Picture(pictures[0]);
						resolve(picture);
					})
					.catch(reject);			
		});
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
		return this.deletePictures(connection, [picture]);
	}

	static deletePictures (connection, pictures) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(pictures, null, `pictures can't be ${pictures}`);
		assert.notEqual(pictures.length, null, `pictures can't be ${pictures}`);

		return new Promise((resolve, reject)=>{
			if (pictures.length <= 0) {
				resolve();
				return;
			}

			let where = "id=?";
		
			let whereValues = [];
			for (let picture of pictures) {
				let obj = [picture.id];
				whereValues.push(obj);
			}

			database.delete(
					connection, 
					TABLENAME, 
					where,
					whereValues
				)
				.then(resolve)
				.catch(reject);
		});
	}

	static getPictureByUserAndId (connection, user, id) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(id, null, `picture id can not be ${id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							id=?
							and user=? 
							and deleteTime is null`;

			let params = [id, user.id];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(pics=>{
						let pic = pics.length > 0 ? pics[0] : null;

						if (pic) {
							pic = new Picture(pic);
						}

						resolve(pic);
					})
					.catch(reject);
		});
	}

	static getUserPicturesUnderDir (connection, user, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(directory.id, null, `directory id can not be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							user=? 
							and directory=? 
							and deleteTime is null`;

			let params = [user.id, directory.id];

			database.executeSql(
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

	static getPicturesUnderDir (connection, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(directory.id, null, `directory id can not be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							and directory=? 
							and deleteTime is null`;

			let params = [directory.id];

			database.executeSql(
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

	static getPictureByUserAndNameAndDir (connection, user, name, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(name, null, `picture name can not be ${name}`);
		assert.notEqual(directory.id, null, `directory id can not be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							user=?
							and name=?
							and directory=? 
							and deleteTime is null`;

			let params = [user.id, name, directory.id];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(pics=>{
						let pic = pics.length > 0 ? pics[0] : null;

						if (pic) {
							pic = new Picture(pic);
						}
						
						resolve(pic);
					})
					.catch(reject);
		});
	}

	static isPictureExistByUserAndNameAndDir (connection, user, name, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(name, null, `picture name can not be ${name}`);
		assert.notEqual(directory.id, null, `directory id can not be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			this.getPictureByUserAndNameAndDir(connection, user, name, directory).then(pic=>{
				resolve(pic != null);
			}).catch(reject);
		});
	}

}

module.exports = Picture;