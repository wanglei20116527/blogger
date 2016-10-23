const assert    = require("assert"); 
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
		let fields = FIELDS.slice(1);
		return new Promise((resolve, reject)=>{
			database.insert(
						connection, 
						TABLENAME, 
						fields, 
						[new Category(category)]
					)
					.then(categories=>{
						resolve(categories[0]);
					})
					.catch(reject);
		});
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
					)
					.then(categories=>{
						resolve(categories[0]);
					})
					.catch(reject);
		});
	}

	static delete (connection, category) {
		return new Promise((resolve, reject)=>{
			if (category.id == null) {
				reject(new Error(`category id can not be ${category.id}`));
				return;
			}

			let where       = "id=?";
			let whereValues = [
				[category.id]
			];

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

	static isCategoryExistByUserAndCategory (connection, user, category) {
		assert.notEqual(user.id , null, `user can not be ${user.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number
						from 
							${TABLENAME} 
						where 
							user=?
							and id=?
							and deleteTime is null`;
			
			let params = [user.id, category.id];

			database.executeSql(
						connection, 
						sql, 
						params
					)
					.then(ret=>{
						resolve(ret[0].number > 0);
					})
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

			database.executeSql(
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

	static isCategoryExistByUserAndName (connection, user, name) {
		return new Promise((resolve, reject)=>{
			if (user.id == null) {
				reject(new Error(`user id can not be ${user.id}`));
				return;
			}

			let sql = `select * from ${TABLENAME} 
								where user=? and name=? and deleteTime is null`;
			let params = [user.id, name];

			database.executeSql(
							connection, 
							sql, 
							params
						)
					.then(categories=>{
						resolve(categories.length > 0);
					})
					.catch(reject);
		});
	}
}

module.exports = Category;