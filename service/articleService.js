
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

		if (underscore.isBoolean(category)) {
			isPublished = category;
			category    = null;
		}

		if (underscore.isBoolean(isPublished)) {
			isPublished = null;
		}

		let p = null;
			
		if (category != null && isPublished == null) {
			p = this.getArticlesByUserAndCategory(conn, user, category);
		
		} else if (category != null && isPublished) {
			p = this.getPublishedArticlesByUserAndCategory(conn, user, category);
		
		} else if (category != null && !isPublished) {
			p = this.getUnPublishedArticlesByUserAndCategory(conn, user, category);	
		
		} else if (isPublished == null) {
			p = this.getArticlesByUser(conn, user); 
		
		} else if (isPublished) {
			p = this.getPublishedArticlesByUser(conn, user); 

		} else {
			p = this.getUnPublishedArticlesByUser(conn, user); 
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

		if (underscore.isBoolean(category)) {
			isPublished = category;
			category    = null;
		}

		if (underscore.isBoolean(isPublished)) {
			isPublished = null;
		}

		let p = null;
			
		if (category != null && isPublished == null) {
			p = this.getNumberOfArticlesByUserAndCategory(conn, user, category);
		
		} else if (category != null && isPublished) {
			p = this.getNumberOfPublishedArticlesByUserAndCategory(conn, user, category);
		
		} else if (category != null && !isPublished) {
			p = this.getNumberOfUnPublishedArticlesByUserAndCategory(conn, user, category);	
		
		} else if (isPublished == null) {
			p = this.getNumberOfArticlesByUser(conn, user); 
		
		} else if (isPublished) {
			p = this.getNumberOfPublishedArticlesByUser(conn, user); 

		} else {
			p = this.getNumberOfUnPublishedArticlesByUser(conn, user); 
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

	getNumberOfUnPublishedArticlesByUser: function () {
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