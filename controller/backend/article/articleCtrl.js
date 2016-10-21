const categoryServive = require("../../../service/categoryServive");
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

		if (category != null) {
			category = {
				id: parseInt(category, 10);
			}
		}

		if (isPublish != null) {
			isPublish = Boolean(isPublish);
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

	getArticles: function (req, res) {
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

		if (category != null) {
			category = {
				id: parseInt(category, 10);
			}
		}

		if (isPublish != null) {
			isPublish = Boolean(isPublish);
		}
		
		articleService.getArticles(user, start, number, category, user).then(articles=>{
			res.json({
				success: true,
				data: {
					articles: articles || []
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
			article  = {},
			category = {},
		} = req.body.article;

		if (article.title != null) {
			article.title = article.title.trim();
		}
			
		if (!article.title) {
			res.json({
				success: false,
				error: {
					code: 190400,
					message: `article title can't be ${article.title}`
				}
			});
			return;
		}

		categoryServive.isCategoryExistByUserAndCategory(user, category)
			.then(isExist=>{
				if (!isExist) {
					res.json({
						success: false,
						error: {
							code: 190401,
							message: `category not exist`
						}
					});
					return;
				}

				article = Object.assign({
					content: "",
					isPublish: 0,
				}, article, {
					date  : Date.now(),
					author: user.id,
					category: category.id
				});

				articleService.addArticle(article).then(article=>{
					res.json({
						success: true,
						data: {
							article: article
						}
					})
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
			article = {},
		} = req.body;

		if (article.title != null) {
			article.title = article.title.trim();
		}

		if (article.id == null) {
			res.json({
				success: false,
				error: {
					code: 190405,
					message: `article id can't be ${article.id}`
				}
			});
			return;
		}

		if (!article.title) {
			res.json({
				success: false,
				error: {
					code: 190400,
					message: `article title can't be ${article.title}`
				}
			});
			return;
		}

		if (article.category == null) {
			res.json({
				success: false,
				error: {
					code: 190404,
					message: `article category can't be ${article.category}`
				}
			});
			return;
		}

		articleService.isArticleExistByIdAndUser(
			article.id,
			user
		).then(isExist=>{
			if (!isExist) {
				res.json({
					success: false,
					error: {
						code: 190404,
						message: `article invalid`
					}
				});
				return;
			}

			article = Object.assign({
				isPublish: 0,
				content: "",
			}, article, {
				author: user.id,
				date: Date.now(),
			});

			articleService.updateArticle(article).then(()=>{
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

		if (articleId == null) {
			res.json({
				success: false,
				error: {
					code: 190401,
					message: `article id can't be ${articleId}`
				}
			});
			return;
		}

		articleService.isArticleExistByIdAndUser(
			articleId,
			user
		).then(!isExist=>{
			if (isExist) {
				res.json({
					success: false,
					error: {
						code: 190404,
						message: `article invalid`
					}
				});
				return;
			}

			let article = {
				id: articleId,
			};

			articleService.deleteArticle(article).then(()=>{
				res.json({
					success: true
				});
			}).catch(err=>{
				console.error(err);
				res.sendStatus(500);
			});

		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});


		let article = {
			id: articleId,
			author: user.id
		};

		
	},
};