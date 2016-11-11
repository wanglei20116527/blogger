const underscore      = require("underscore");
const categoryService = require("../../../service/categoryService");
const articleService  = require("../../../service/articleService");

const NUMBER = 10;

module.exports = {
	getNumberOfArticles: function (req, res) {
		let {
			user
		} = req.session.user;

		user = Object.assign({}, user || {});

		let {
			category,
			isPublish,
		} = req.query;

		category = parseInt(category, 10);
		if (Number.isInteger(category)) {
			category = {
				id: category
			}
		} else {
			category = void 0;
		}

		if (!underscore.isBoolean(isPublish)) {
			isPublish = void 0;
		}

		articleService.getNumberOfArticles(user, category, isPublish).then(number=>{
			res.json({
				success: true,
				data: {
					number: number || 0
				}
			});
		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	getStatisticOfArticles: function (req, res) {
		let {
			user
		} = req.session.user;

		articleService.getStatisticOfArticles(user).then(statistic=>{
			res.json({
				success: true,
				data: {
					statistic: statistic
				}
			});
		})
		.catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	getArticles: function (req, res) {;
		let {
			user
		} = req.session.user;

		user = Object.assign({}, user || {});

		let {
			start  = 0,
			number = NUMBER,
			category,
			isPublish
		} = req.query;

		start = parseInt(start, 10);
		if (!Number.isInteger(start)) {
			start = 0;
		}

		number = parseInt(number, 10);
		if (!Number.isInteger(number)) {
			number = NUMBER;
		}

		category = parseInt(category, 10);
		if (Number.isInteger(category)) {
			category = {
				id: category
			}
		} else {
			category = null;
		}

		if (isPublish === "true") {
			isPublish = true;
		} else if (isPublish === "false") {
			isPublish = false;
		} else {
			isPublish = null;
		}

		let promises = [];
		let p = null;

		p = articleService.getNumberOfArticles(user, category, isPublish);
		promises.push(p);

		p = articleService.getArticles(user, start, number, category, isPublish);
		promises.push(p);

		Promise.all(promises).then(ret=>{
			let number   = ret[0] || 0;
			let articles = ret[1] || [];

			for (let article of articles) {
				article.isPublish = article.isPublish === "1";
			}

			res.json({
				success: true,
				data: {
					total   : number,
					articles: articles
				}
			});
		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	addArticle: function (req, res) {
		let {
			user
		} = req.session.user;

		user = Object.assign({}, user || {});

		let {
			article,
			category,
		} = req.body;

		if (!underscore.isObject(article) || !underscore.isObject(category)) {
			res.json({
				success: false,
				error: {
					code: 190401,
					message: `article or category invalid`
				}
			});
			return;
		}
			
		if (!underscore.isString(article.title)) {
			res.json({
				success: false,
				error: {
					code: 190402,
					message: `article title can't be ${article.title}`
				}
			});
			return;
		}
		article.title = article.title.trim();

		if (!underscore.isString(article.content)) {
			res.json({
				success: false,
				error: {
					code: 190403,
					message: `article content can't be ${article.content}`
				}
			});
			return;
		}

		if (!underscore.isString(article.markdown)) {
			res.json({
				success: false,
				error: {
					code: 190403,
					message: `article markdown can't be ${article.markdown}`
				}
			});
			return;
		}

		if (!underscore.isBoolean(article.isPublish)) {
			res.json({
				success: false,
				error: {
					code: 190404,
					message: `article isPublish can't be ${article.isPublish}`
				}
			});
			return;	
		}

		article.isPublish = article.isPublish ? "1" : "0";

		if (!Number.isInteger(category.id)) {
			res.json({
				success: false,
				error: {
					code: 190405,
					message: `category id can't be ${category.id}`
				}
			});
			return;
		}

		categoryService.isCategoryExistByUserAndCategory(user, category)
			.then(isExist=>{
				if (!isExist) {
					res.json({
						success: false,
						error: {
							code: 190406,
							message: `category not exist`
						}
					});
					return;
				}

				article = Object.assign({}, article, {
					date  : Date.now(),
					author: user.id,
					category: category.id
				});

				articleService.addArticle(article).then(article=>{
					article.isPublish = article.isPublish === "1";

					delete article.createTime;
					delete article.updateTime;
					delete article.deleteTime;

					res.json({
						success: true,
						data: {
							article: article
						}
					});

				}).catch(err=>{
					console.error(err);
					res.sendStatus(500);
				});
			})
			.catch(err=>{
				console.error(err);
				res.sendStatus(500);
			});
	},

	updateArticle: function (req, res) {
		let {
			user
		} = req.session.user;

		user = Object.assign({}, user || {});

		let {
			article
		} = req.body;

		if (!underscore.isObject(article) 
			|| !Number.isInteger(article.id) 
			|| !underscore.isString(article.title)
			|| !underscore.isString(article.content)
			|| !underscore.isString(article.markdown)
			|| !Number.isInteger(article.author)
			|| !Number.isInteger(article.category)
			|| !underscore.isBoolean(article.isPublish)) {

			res.json({
				success: false,
				error: {
					code: 190407,
					message: `article invalid`
				}
			});
			return;
		}

		article.isPublish = article.isPublish ? "1": "0";

		let promises = [];
		let p = null;

		p = categoryService.isCategoryExistByUserAndCategory(user, {
			id: article.category
		});
		promises.push(p);

		p = articleService.isArticleExistByIdAndUser(
			article.id,
			user
		);
		promises.push(p);

		Promise.all(promises).then(ret=>{
			let isCategoryExist = ret[0];

			if (!isCategoryExist) {
				res.json({
					success: false,
					error: {
						code: 190408,
						message: `category not exist: id ${article.category}`
					}
				});
				return;
			}

			let isArticleExist = ret[1];

			if (!isArticleExist) {
				res.json({
					success: false,
					error: {
						code: 190409,
						message: `category not exist: id ${article.category}`
					}
				});
				return;
			}

			article.title   = article.title.trim();
			article.content = article.content.trim();

			article = Object.assign(article, {
				author: user.id,
				date: Date.now(),
			});

			articleService.updateArticle(article).then(article=>{
				article.isPublish = article.isPublish === "1";

				delete article.createTime;
				delete article.updateTime;
				delete article.deleteTime;

				res.json({
					success: true,
					data: {
						article: article
					}
				});
			}).catch(err=>{
				console.error(err);
				res.sendStatus(500);
			});
		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	deleteArticle: function (req, res) {
		let {
			user
		} = req.session.user;

		user = Object.assign({}, user || {});

		let {
			article: articleId
		} = req.query;

		articleId = parseInt(articleId, 10);

		if (!Number.isInteger(articleId)) {
			res.json({
				success: false,
				error: {
					code: 190410,
					message: `article id can't be ${articleId}`
				}
			});
			return;
		}

		articleService.isArticleExistByIdAndUser(
			articleId,
			user
		).then(isExist=>{
			if (!isExist) {
				res.json({
					success: false,
					error: {
						code: 190411,
						message: `article not exist`
					}
				});
				return;
			}

			let article = {
				id: articleId,
			};

			articleService.deleteArticle(article).then(()=>{
				res.json({
					success: true,
					data: {
						article: article
					}
				});
			}).catch(err=>{
				console.error(err);
				res.sendStatus(500);
			});

		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},
};