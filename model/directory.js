const assert    = require("assert");
const database  = require("./database");

const TABLENAME = "directory";
const FIELDS = [
	"id",
	"name", 
	"parentDirectory",
	"user",
	"path",
	"date"
];

class Directory {
	constructor (directory) {
		for (let field of FIELDS) {
			this[field] = field in directory ? directory[field] : null;
		}
	}

	static isExistByUserAndId (connection, user, id) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(id, null, `id can't be ${id}`);

		return new Promise((resolve, reject)=>{
			this.getDirByUserAndId(connection, user, id).then(dir=>{
				resolve(dir != null);
			}).catch(reject);
		});
	}

	static isRootDirExistByUserAndName (connection, user, name) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(name, null, `directory name can't be ${name}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select
							*
						from
							${TABLENAME}
						where
							user=?
							and name=?
							and parentDirectory is null
							and deleteTime is null`;

			let params = [user.id, name];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(dirs=>{
						resolve(dirs.length > 0);
					})
					.catch(reject);
		});
	}

	static isSubDirExistByUserAndName (connection, user, name, pDir) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(name, null, `directory name can't be ${name}`);
		assert.notEqual(pDir.id, null, `parent directory id can't be ${pDir.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select
							*
						from
							${TABLENAME}
						where
							user=?
							and name=?
							and parentDirectory=?
							and deleteTime is null`;

			let params = [user.id, name, pDir.id];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(dirs=>{
						resolve(dirs.length > 0);
					})
					.catch(reject);
		});
	}

	static getDirByUserAndId (connection, user, id) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(id, null, `id can't be ${id}`);

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
					.then(dirs=>{
						let dir = dirs.length > 0 ? dirs[0] : null;

						if (dir != null) {
							dir = new Directory(dir);
						}

						resolve(dir);
					})
					.catch(reject);
		});
	}

	static getDirsByUserAndIds (connection, user, ids) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(ids, null, `ids can't be ${ids}`);
		assert.notEqual(ids.length, null, `ids can't be ${ids}`);

		let promises = [];
		let p = null;

		for (let id of ids) {
			p = this.getDirByUserAndId(connection, user, id);
			promises.push(p);
		}

		return Promise.all(promises);
	}

	static add (connection, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(directory, null, `directory can't be ${directory}`);

		return new Promise((resolve, reject)=>{
			let fields = FIELDS.slice(1);

			database.insert(
						connection, 
						TABLENAME, 
						fields, 
						[new Directory(directory)]
					)
					.then(ret=>{
						resolve(new Directory(ret[0]));
					}).catch(reject);
		});
	}

	static update (connection, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(directory.id, null, `directory id can't be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			database.update(
					connection, 
					TABLENAME, 
					FIELDS, 
					[new Directory(directory)]
				)
				.then(ret=>{
					resolve([new Directory(directory)]);
				}).catch(reject);;
		});
	}

	static delete (connection, directory) {
		return this.deleteDirs(connection, [directory]);
	}

	static deleteDirs (connection, directories) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(directories, null, `directories can't be ${directories}`);
		assert.notEqual(directories.length, null, `directories can't be ${directories}`);

		return new Promise((resolve, reject)=>{
			if (directories.length <= 0) {
				resolve();
				return;
			}

			let where = "id=?";
		
			let whereValues = [];
			for (let directory of directories) {
				let obj = [directory.id];
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

	static getUserRootDirs (connection, user, start, number) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(start, null, `start can not be ${start}`);
		assert.notEqual(number, null, `number can not be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							user=? 
							and parentDirectory is null 
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, start, number];

			database.executeSql(
							connection, 
							sql, 
							params
							)
					.then(dirs=>{
						let tDirs = [];
						for (let dir of dirs) {
							dir = new Directory(dir);
							tDirs.push(dir);
						}
						resolve(tDirs);
					})
					.catch(reject);
		});
	}

	static getNumberOfUserRootDirs (connection, user) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number
						from 
							${TABLENAME}
						where 
							user=? 
							and parentDirectory is null 
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

	static getUserSubDirs (connection, user, directory, start, number) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(directory.id, null, `directory id can't be ${directory.id}`);
		assert.notEqual(start, null, `start can not be ${start}`);
		assert.notEqual(number, null, `number can not be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where 
							user=? 
							and parentDirectory=? 
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, directory.id, start, number];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(dirs=>{
						let tDirs = [];
						for (let dir of dirs) {
							dir = new Directory(dir);
							tDirs.push(dir);
						}
						resolve(tDirs);
					})
					.catch(reject);
		});
	}

	static getNumberOfUserSubDirs (connection, user, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(user.id, null, `user id can't be ${user.id}`);
		assert.notEqual(directory.id, null, `directory id can't be ${directory.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME}
						where 
							user=? 
							and parentDirectory=? 
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

	static getAllSubDirs (connection, directory) {
		assert.notEqual(connection, null, `connection can't be ${connection}`);
		assert.notEqual(directory.id, null, `directory id can't be ${directory.id}`);
		assert.notEqual(directory.user, null, `directory user can't be ${directory.user}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME}
						where
							user = ?
							and parentDirectory=? 
							and deleteTime is null`;

			let params = [directory.user, directory.id];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(dirs=>{
						let tDirs = [];
						for (let dir of dirs) {
							dir = new Directory(dir);
							tDirs.push(dir);
						}
						resolve(tDirs);
					})
					.catch(reject);
		});
	}
}

module.exports = Directory;