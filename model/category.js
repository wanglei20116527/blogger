const database  = require("./database");

const TABLENAME = "category";
const FIELDS = [
	"id",
	"name", 
	"user"
];

class Category {
	constructor (category) {
		for (let field of FIELDS) {
			this[field] = field in category ? category[field] : null;
		}
	}

	static add (connection, category) {
		return database.insert(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Category(category)]
						);
	}

	static update (connection, category) {
		return new Promise((resolve, reject)=>{
			if (category.id == null) {
				reject(new Error(`category id can not be ${category.id}`));
				return;
			}

			database.update(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Category(category)]
					);
					.then(resolve)
					.catch(reject);
		});
	}

	static delete (connection, category) {
		return new Promise((resolve, reject)=>{
			if (category.id == null) {
				reject(new Error(`category id can not be ${category.id}`));
				return;
			}

			database.update(
						connection, 
						TABLENAME, 
						[new Category(category)]
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static getCategoriesByUser (connection, user) {
		return new Promise((resolve, reject)=>{
			if (user.id == null) {
				reject(new Error(`user id can not be ${user.id}`));
				return;
			}

			let sql = `select * from ${TABLENAME} 
								where user=? and deleteTime is null`;
			let params = [user.id];

			database.execute(
							connection, 
							sql, 
							params
							)
					.then(categories=>{
						let ret = [];
						for (let category of categories) {
							category = new Category(category);
							ret.push(category);
						}
						resolve(ret);
					})
					.catch(reject);
		});
	}
}

module.exports = Category;