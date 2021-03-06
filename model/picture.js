const assert    = require("assert");
const database  = require("./database");

const TABLENAME = "picture";
const FIELDS = [
	"id",
	"name", 
	"path",
	"url",
	"user",
	"date",
	"directory",
	"thumbnail",
	"thumbnailPath"
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
					.then(()=>{
						resolve(picture);
					})
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

	static getPicturesByUserUnderDir (connection, user, directory, start, number) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(directory.id, null, `directory id can not be ${directory.id}`);
		assert.notEqual(start, null, `start can not be ${start}`);
		assert.notEqual(number, null, `number can not be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							user=? 
							and directory=? 
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, directory.id, start, number];

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

	static getNumberOfPicturesByUserUnderDir (connection, user, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(directory.id, null, `directory id can not be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number  
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
					.then(ret=>{

						resolve(ret[0].number);
					})
					.catch(reject);
		});
	}

	static getPictruesByUserUnderRootDir (connection, user, start, number) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(start, null, `start can not be ${start}`);
		assert.notEqual(number, null, `number can not be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							user=?
							and directory is null 
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, start, number];

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

	static getNumberOfPictruesByUserUnderRootDir (connection, user) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME}
						where 
							user=?
							and directory is null 
							and deleteTime is null`;

			let params = [user.id];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(ret=>{
						resolve(ret[0].number);
					})
					.catch(reject);
		});
	}

	static getAllPicturesUnderDir (connection, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(directory.id, null, `directory id can not be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							directory=? 
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

	static getPictureByUserAndNameAndRootDir (connection, user, name) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(name, null, `picture name can not be ${name}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							user=?
							and name=?
							and directory is null 
							and deleteTime is null`;

			let params = [user.id, name];

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

	static isPictureExistByUserAndNameAndRootDir (connection, user, name) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can not be ${user.id}`);
		assert.notEqual(name, null, `picture name can not be ${name}`);

		return new Promise((resolve, reject)=>{
			this.getPictureByUserAndNameAndRootDir(connection, user, name).then(pic=>{
				resolve(pic != null);
			}).catch(reject);
		});
	}

}

module.exports = Picture;