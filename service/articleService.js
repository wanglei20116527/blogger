const underscore   = require("underscore");
const assert       = require("assert");
const database     = require("../model/database");
const articleModel = require("../model/article");

module.exports = {
	isArticleExistByIdAndUser: function (articleId, user) {
		return database.executeTemplate(conn=>{
			return articleModel.isArticleExistByIdAndUser(conn, articleId, user);
		});
	},

	getStatisticOfArticles: function (user) {
		assert(user.id, null, `user id can't be ${user.id}`);

		return database.executeTemplate(conn=>{
			return new Promise((resolve, reject)=>{
				let promises = [];
				let p = null;

				p = articleModel.getArticleNumberByUser(conn, user);
				promises.push(p);

				p = articleModel.getPublishedArticleNumberByUser(conn, user);
				promises.push(p);

				Promise.all(promises).then(ret=>{
					resolve({
						total: ret[0] || 0,
						numOfPublished: ret[1] || 0
					});
				})
				.catch(reject);
			});
		});
	},

	addArticle: function (article) {
		return database.executeTemplate(conn=>{
			return articleModel.add(conn, article);
		});
	},

	updateArticle: function (article) {
		return database.executeTemplate(conn=>{
			return articleModel.update(conn, article);
		});
	},

	deleteArticle: function (article) {
		return database.executeTemplate(conn=>{
			return articleModel.delete(conn, article);
		});
	},

	getArticles: function (user, start, number, category, isPublished) {
		assert(user.id, null, `user id can't be ${user.id}`);

		let p = null;
			
		if (category != null && isPublished == null) {
			console.log('getArticlesByUserAndCategory');
			p = this.getArticlesByUserAndCategory(user, category, start, number);
		
		} else if (category != null && isPublished) {
			console.log('getPublishedArticlesByUserAndCategory');
			p = this.getPublishedArticlesByUserAndCategory(user, category, start, number);
		
		} else if (category != null && !isPublished) {
			console.log('getUnPublishedArticlesByUserAndCategory');
			p = this.getUnPublishedArticlesByUserAndCategory(user, category, start, number);	
		
		} else if (isPublished == null) {
			console.log('getArticlesByUser');
			p = this.getArticlesByUser(user, start, number); 
		
		} else if (isPublished) {
			console.log('getPublishedArticlesByUser');
			p = this.getPublishedArticlesByUser(user, start, number); 

		} else {
			console.log('getUnPublishedArticlesByUser');
			p = this.getUnPublishedArticlesByUser(user, start, number); 
		}

		return p;
	},

	getArticlesByUser: function (user, start, number) {
		return database.executeTemplate(conn=>{
			return articleModel.getArticlesByUser(conn, user, start, number);
		});
	},

	getPublishedArticlesByUser: function (user, start, number) {
		return database.executeTemplate(conn=>{
			return articleModel.getPublishedArticlesByUser(conn, user, start, number);
		});
	},

	getUnPublishedArticlesByUser: function (user, start, number) {
		return database.executeTemplate(conn=>{
			return articleModel.getUnPublishedArticlesByUser(conn, user, start, number);
		});
	},

	getArticlesByUserAndCategory: function (user, category, start, number) {
		return database.executeTemplate(conn=>{
			return articleModel.getArticlesByUserAndCategory(conn, user, category, start, number);
		});
	},

	getPublishedArticlesByUserAndCategory: function (user, category, start, number) {
		return database.executeTemplate(conn=>{
			return articleModel.getPublishedArticlesByUserAndCategory(conn, user, category, start, number);
		});
	},

	getUnPublishedArticlesByUserAndCategory: function (user, category, start, number) {
		return database.executeTemplate(conn=>{
			return articleModel.getUnPublishedArticlesByUserAndCategory(conn, user, category, start, number);
		});
	},

	getNumberOfArticles: function (user, category, isPublished) {
		assert(user.id, null, `user id can't be ${user.id}`);

		let p = null;
			
		if (category != null && isPublished == null) {
			console.log('getNumberOfArticlesByUserAndCategory');
			p = this.getNumberOfArticlesByUserAndCategory(user, category);
		
		} else if (category != null && isPublished) {
			console.log('getNumberOfPublishedArticlesByUserAndCategory');
			p = this.getNumberOfPublishedArticlesByUserAndCategory(user, category);
		
		} else if (category != null && !isPublished) {
			console.log('getNumberOfUnPublishedArticlesByUserAndCategory');
			p = this.getNumberOfUnPublishedArticlesByUserAndCategory(user, category);	
		
		} else if (isPublished == null) {
			console.log('getNumberOfArticlesByUser');
			p = this.getNumberOfArticlesByUser(user); 
		
		} else if (isPublished) {
			console.log('getNumberOfPublishedArticlesByUser');
			p = this.getNumberOfPublishedArticlesByUser(user); 

		} else {
			console.log('getNumberOfUnPublishedArticlesByUser');
			p = this.getNumberOfUnPublishedArticlesByUser(user); 
		}

		return p;
	},

	getNumberOfArticlesByUser: function (user) {
		return database.executeTemplate(conn=>{
			return articleModel.getArticleNumberByUser(conn, user);
		});
	},

	getNumberOfPublishedArticlesByUser: function (user) {
		return database.executeTemplate(conn=>{
			return articleModel.getPublishedArticleNumberByUser(conn, user);
		});
	},

	getNumberOfUnPublishedArticlesByUser: function (user) {
		return database.executeTemplate(conn=>{
			return articleModel.getUnPublishedArticleNumberByUser(conn, user);
		});
	},

	getNumberOfArticlesByUserAndCategory: function (user, category) {
		return database.executeTemplate(conn=>{
			return articleModel.getArticleNumberByUserAndCategory(conn, user, category);
		});
	},

	getNumberOfPublishedArticlesByUserAndCategory: function (user, category) {
		return database.executeTemplate(conn=>{
			return articleModel.getPublishedArticleNumberByUserAndCategory(conn, user, category);
		});
	},

	getNumberOfUnPublishedArticlesByUserAndCategory: function (user, category) {
		return database.executeTemplate(conn=>{
			return articleModel.getUnPublishedArticleNumberByUserAndCategory(conn, user, category);
		});
	},
};