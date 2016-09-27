const database  = require("./database");

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
		return new Promise((resolve, reject)=>{
			if (article.id == null) {
				reject(new Error(`article id can not be ${article.id}`));
				return;
			}

			database.update(
						connection, 
						TABLENAME, 
						FIELDS, 
						[new Article(article)]
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static delete (connection, article) {
		return new Promise((resolve, reject)=>{
			if (article.id == null) {
				reject(new Error(`article id can not be ${article.id}`));
				return;
			}

			database.delete(
						connection, 
						TABLENAME, 
						[new Article(article)]
					)
					.then(resolve)
					.catch(reject);
		});
	}

	static getAllArticlesByUser (connection, user) {
		return new Promise((resolve, reject)=>{
			if (user.id == null) {
				reject(new Error(`user id can not be ${user.id}`));
				return;
			}

			let sql = `select * from ${TABLENAME}
								where author=? and deleteTime is null`;
			let params = [user.id];

			database.execute(
						connection, 
						sql, 
						params)
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

	static getPublishedArticlesByUser (connection, user) {
		return new Promise((resolve, reject)=>{
			if (user.id == null) {
				reject(new Error(`user id can not be ${user.id}`));
				return;
			}

			let sql = `select * from ${TABLENAME}
								where author=? and isPublish=? and deleteTime is null`;
			let params = [user.id, 1];

			database.execute(
						connection, 
						sql, 
						params)
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
