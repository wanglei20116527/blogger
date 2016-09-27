const database  = require("./database");

const TABLENAME = "directory";
const FIELDS = [
	"id",
	"name", 
	"parentDirectory",
	"user"
];

class Directory {
	
	constructor (directory) {
		for (let field of FIELDS) {
			this[field] = field in directory ? directory[field] : null;
		}
	}

	static add (connection, directory) {
		return database.insert(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Directory(directory)]
					);
	}

	static update (connection, directory) {
		return new Promise((resolve, reject)=>{
			if (directory.id == null) {
				reject(new Error(`directory id can not be ${directory.id}`));
				return;
			}

			database.update(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Directory(directory)]
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static delete (connection, directory) {
		return new Promise((resolve, reject)=>{
			if (directory.id == null) {
				reject(new Error(`directory id can not be ${directory.id}`));
				return;
			}

			database.delete(
						connection, 
						TABLENAME, 
						[new Directory(directory)]
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static getUserRootDirectory (connection, user) {
		return new Promise((resolve, reject)=>{
			if (user.id == null) {
				reject(new Error(`user id can not be ${user.id}`));
				return;
			}

			let sql = `select * from ${TABLENAME}
								where user=? and parentDirectory is null and deleteTime is null`;
			let params = [user.id];

			database.executeSql(
							connection, 
							sql, 
							params
							)
					.then(directories=>{
						let ret = [];
						for (let directory of directories) {
							directory = new Directory(directory);
							ret.push(directory);
						}
						resolve(ret);
					})
					.catch(reject);
		});
	}

	static getUserSubDirectory (connection, user, directory) {
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
								where user=? and parentDirectory=? and deleteTime is null`;
			let params = [user.id, directory.id];

			database.executeSql(
							connection, 
							sql, 
							params
							)
					.then(directories=>{
						let ret = [];
						for (let directory of directories) {
							directory = new Directory(directory);
							ret.push(directory);
						}
						resolve(ret);
					})
					.catch(reject);
		});
	}
}

module.exports = Directory;