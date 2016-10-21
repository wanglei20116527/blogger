const assert   = require('assert');
const database = require("./database");

const TABLENAME = "article";
const FIELDS = [
	"id",
	"title", 
	"content",
	"date",
	"author",
	"category",
	"isPublish"
];

class Article {

	constructor (article) {
		for (let field of FIELDS) {
			this[field] = field in article ? article[field] : null;
		}
	}

	static add (connection, article) {
		return database.insert(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Article(article)]
					);
	}

	static update (connection, article) {
		assert(article.id, null, `article id can not be ${article.id}`);
		assert(article.author, null, `article author can not be ${article.author}`);

		return new Promise((resolve, reject)=>{
			let where       = "id=? and author=?";
			let whereValues = [
				{
					id    : article.id,
					author: article.author
				}
			];
 			database.update(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Article(article)],
						where,
						whereValues
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static delete (connection, article) {
		assert(article.id, null, `article id can not be ${article.id}`);
		assert(article.author, null, `article author can not be ${article.author}`);

		return new Promise((resolve, reject)=>{
			let where       = "id=? and author=?";
			let whereValues = [
				{
					id    : article.id,
					author: article.author
				}
			];

			database.delete(
						connection, 
						TABLENAME,
						FIELDS,
						[new Article(article)],
						where,
						whereValues
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static deleteByCategory (connection, category) {
		return new Promise((resolve, reject)=>{
			if (category.id == null) {
				reject(new Error(`deleteByCategory: category id can not be ${category.id}`));
				return;
			}

			this.getArticlesByCategory(connection, category).then((articles)=>{
				let ToDelete = [];
				for (let article of articles) {
					ToDelete.push(new Article(article));
				}

				database.delete(
							connection,
							TABLENAME,
							FIELDS,
							ToDelete
						)
						.then(resolve)
						.catch(reject);
			}).catch(reject);
		});
	}

	static isArticleExistByIdAndUser (connection, id, user) {
		assert(id, null, `id can't be ${id}`);
		assert(user.id, null, `user id can't be ${user.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME} 
						where 
							id=?
							and author=? 
							and deleteTime is null`;


			let params = [id, user.id];

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

	static getArticleNumberByUser (connection, user) {
		assert(user.id, null, `user id can't be ${user.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME} 
						where 
							author=? 
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

	static getPublishedArticleNumberByUser (connection, user) {
		assert(user.id, null, `user id can't be ${user.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME} 
						where 
							author=? 
							and isPublish=?
							and deleteTime is null`;

			let params = [user.id, 1];

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

	static getUnPublishedArticleNumberByUser (connection, user) {
		assert(user.id, null, `user id can't be ${user.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME} 
						where 
							author=? 
							and isPublish=?
							and deleteTime is null`;

			let params = [user.id, 0];

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

	static getArticleNumberByUserAndCategory (connection, user, category) {
		assert(user.id, null, `user id can't be ${user.id}`);
		assert(category.id, null, `category id can't be ${category.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME} 
						where 
							author=? 
							and category=?
							and deleteTime is null`;

			let params = [user.id, category.id];

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

	static getPublishedArticleNumberByUserAndCategory (connection, user, category) {
		assert(user.id, null, `user id can't be ${user.id}`);
		assert(category.id, null, `category id can't be ${category.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME} 
						where 
							author=? 
							and isPublish=?
							and category=?
							and deleteTime is null`;

			let params = [user.id, 1, category.id];

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

	static getUnPublishedArticleNumberByUserAndCategory (connection, user, category) {
		assert(user.id, null, `user id can't be ${user.id}`);
		assert(category.id, null, `category id can't be ${category.id}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							count(*) as number 
						from 
							${TABLENAME} 
						where 
							author=? 
							and isPublish=?
							and category=?
							and deleteTime is null`;

			let params = [user.id, 0, category.id];

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

	static getArticlesByUser (connection, user, start, number) {
		assert(user.id, null, `user id can't be ${user.id}`);
		assert(start  , null, `start id can't be ${start}`);
		assert(number , null, `number id can't be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME} 
						where 
							author=? 
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, start, number];

			database.executeSql(
						connection, 
						sql, 
						params
					)
					.then(articles => {
						let ret = [];
						for (let article of articles) {
							article = new Article(article);
							ret.push(article);
						}
						resolve(article);
					})
					.catch(reject);
		});
	}

	static getPublishedArticlesByUser (connection, user, start, number) {
		assert(user.id, null, `user id can't be ${user.id}`);
		assert(start  , null, `start id can't be ${start}`);
		assert(number , null, `number id can't be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME} 
						where 
							author=? 
							and isPublish=?
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, 1, start, number];

			database.executeSql(
						connection, 
						sql, 
						params
					)
					.then(articles => {
						let ret = [];
						for (let article of articles) {
							article = new Article(article);
							ret.push(article);
						}
						resolve(article);
					})
					.catch(reject);
		});
	}

	static getUnPublishedArticlesByUser (connection, user, start, number) {
		assert(user.id, null, `user id can't be ${user.id}`);
		assert(start  , null, `start id can't be ${start}`);
		assert(number , null, `number id can't be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME} 
						where 
							author=? 
							and isPublish=?
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, 0, start, number];

			database.executeSql(
						connection, 
						sql, 
						params
					)
					.then(articles => {
						let ret = [];
						for (let article of articles) {
							article = new Article(article);
							ret.push(article);
						}
						resolve(article);
					})
					.catch(reject);
		});
	}

	static getArticlesByUserAndCategory (connection, user, category, start, number) {
		assert(user.id    , null, `user id can't be ${user.id}`);
		assert(category.id, null, `category id can't be ${category.id}`);
		assert(start      , null, `start id can't be ${start}`);
		assert(number     , null, `number id can't be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME} 
						where 
							author=? 
							and category=?
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, category.id, start, number];

			database.executeSql(
						connection, 
						sql, 
						params
					)
					.then(articles => {
						let ret = [];
						for (let article of articles) {
							article = new Article(article);
							ret.push(article);
						}
						resolve(article);
					})
					.catch(reject);
		});
	}

	static getPublishedArticlesByUserAndCategory (connection, user, category, start, number) {
		assert(user.id    , null, `user id can't be ${user.id}`);
		assert(category.id, null, `category id can't be ${category.id}`);
		assert(start      , null, `start id can't be ${start}`);
		assert(number     , null, `number id can't be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME} 
						where 
							author=? 
							and category=?
							and isPublish=?
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, category.id, 1, start, number];

			database.executeSql(
						connection, 
						sql, 
						params
					)
					.then(articles => {
						let ret = [];
						for (let article of articles) {
							article = new Article(article);
							ret.push(article);
						}
						resolve(article);
					})
					.catch(reject);
		});
	}

	static getUnPublishedArticlesByUserAndCategory (connection, user, category, start, number) {
		assert(user.id    , null, `user id can't be ${user.id}`);
		assert(category.id, null, `category id can't be ${category.id}`);
		assert(start      , null, `start id can't be ${start}`);
		assert(number     , null, `number id can't be ${number}`);

		return new Promise((resolve, reject)=>{
			let sql = 	`select 
							* 
						from 
							${TABLENAME} 
						where 
							author=? 
							and category=?
							and isPublish=?
							and deleteTime is null
						limit ?,?`;

			let params = [user.id, category.id, 0, start, number];

			database.executeSql(
						connection, 
						sql, 
						params
					)
					.then(articles => {
						let ret = [];
						for (let article of articles) {
							article = new Article(article);
							ret.push(article);
						}
						resolve(article);
					})
					.catch(reject);
		});
	}
}

module.exports = Article;
