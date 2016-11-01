const database  = require("./database");

const TABLENAME = "user";
const FIELDS    = [
	"id",
	"name", 
	"password",
	"email",
	"phone",
	"about",
	"photo",
	"home"
];

class User {

	constructor (user) {
		for (let field of FIELDS) {
			this[field] = field in user ? user[field] : null;
		}
	}

	static add (connection, user) {
		return new Promise((resolve, reject)=>{
			return database.insert(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new User(user)]
					)
					.then(users=>{
						resolve(users[0]);
					})
					.catch(reject);
		});
		
	}

	static update (connection, user) {
		return new Promise((resolve, reject)=>{
			if (user.id == null) {
				reject(new Error(`user id can not be ${user.id}`));
				return;
			}

			database.update(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new User(user)]
					)
					.then(function () {
						resolve(user);
					})
					.catch(reject);
		});
	}

	static getUserByName (connection, name, user) {

	}

	static getUserByNameAndPassword (connection, name, password) {
		let sql = `select * from ${TABLENAME} 
				   			where name=? and password=? and deleteTime is null`;

		let params = [name, password];

		return new Promise((resolve, reject)=>{
			database.executeSql(connection, sql, params).then(users=>{
				if (!users || users.length <= 0) {
					resolve(null);
					return;
				}

				resolve(new User(users[0]));
			
			}).catch(reject);
		});
	}
}

module.exports = User;
