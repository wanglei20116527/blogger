const underscore      = require("underscore");
const validation      = require("../../../utils/validation");
const categoryService = require("../../../service/categoryService");

module.exports = {	
	getCategories: function (req, res) {
		let {
			user
		} = req.session.user;

		user = Object.assign({}, user || {});
		
		categoryService.getCategoriesByUser(user).then((categories)=>{
			res.json({
				success: true,
				data: {
					categories: categories || []
				}
			});
		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	addCategory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			name = ''
		} = req.body;

		if (!underscore.isString(name) || !validation.checkCategoryName(name)) {
			res.json({
				success: false,
				error: {
					code: 190300,
					message: `category name ${name} invalid`
				}
			});
			return;
		}

		categoryService.isCategoryExistByUserAndName(user, name).then(isExist=>{
			if (isExist) {
				res.json({
					success: false,
					error: {
						code: 190301,
						message: `category ${name} already exist`
					}
				});
				return;
			}

			let category = {
				name: name,
				user: user.id
			};

			categoryService.addCategory(category).then((category)=>{
				res.json({
					success: true,
					data: {
						category: category
					}
				});
			}).catch(err=>{
				throw err;
			});

		}).catch(err=>{
			console.error(err);
			res.sendStatus(500);
		});
	},

	updateCategory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			category
		} = req.body;

		if (!Number.isInteger(category.id)) {
			res.json({
				success: false,
				error: {
					code: 190302,
					message: `category id ${category.id} invalid`
				}
			});
			return;
		}

		let name = category.name;
		if (!underscore.isString(name) || !validation.checkCategoryName(name)) {
			res.json({
				success: false,
				error: {
					code: 190300,
					message: `category name ${name} invalid`
				}
			});
			return;
		}

		category.user = user.id;

		categoryService.isCategoryExistByUserAndCategory(user, category)
			.then(isExist=>{
				if (!isExist) {
					res.json({
						success: false,
						error: {
							code: 190300,
							message: `category invalid`
						}
					});
					return;
				}

				categoryService.updateCategory(category).then((category)=>{
					res.json({
						success: true,
						data: {
							category: category
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

	deleteCategory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			category: categoryId
		} = req.query;

		categoryId = parseInt(categoryId);

		if (!Number.isInteger(categoryId)) {
			res.json({
				success: false,
				error: {
					code: 190302,
					message: `category id ${categoryId} invalid`
				}
			});
			return;
		}

		let category = {
			id: categoryId,
			user: user.id
		};

		categoryService.isCategoryExistByUserAndCategory(user, category)
			.then(isExist=>{
				if (!isExist) {
					res.json({
						success: false,
						error: {
							code: 190300,
							message: `category not exist`
						}
					});
					return;
				}

				categoryService.deleteCategory(category).then(()=>{
					res.json({
						success: true,
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

	deleteCategories: function (req, res) {
		try {
			let {
				user
			} = req.session.user;

			let {
				category: ids
			} = req.query;

			let promises = [];
			let p = null;

			let categories = [];
			ids = ids.split(",");

			for (let i = 0, len = ids.length; i < len; ++i) {
				let id = parseInt(ids[i], 10);

				if (!Number.isInteger(id)) {
					res.json({
						success: false,
						error: {
							code: 190000,
							message: `category id ${id} invalid`	
						}
					});
					return;
				}

				ids[i] = id;

				let category = {
					id: id,
					user: user.id
				};

				p = categoryService.isCategoryExistByUserAndCategory(user, category);
				promises.push(p);
				
				categories.push(category);
			}

			Promise.all(promises).then(isExists=>{
				for (let i = 0, len = isExists.length; i < len; ++i) {
					if (!isExists[i]) {
						let err = new Error(`category ${ids[i]} not exist`);
						err.code = 190000;
						throw err;
					}
				}

				return categoryService.deleteCategories(categories);
			})
			.then(()=>{
				res.json({
					success: true,
				});
			})
			.catch(err=>{
				console.error(err);

				if (err.statusCode) {
					res.sendStatus(err.statusCode);
					return;
				}

				if (err.code) {
					res.json({
						success: false,
						error: {
							code: err.code,
							message: err.message || err.stack	
						}
					});
					return;
				}
			});

		} catch (err) {
			console.error(err);

			if (err.code) {
				res.json({
					success: false,
					error: {
						code: err.code,
						message: err.message || err.stack	
					}
				});
				return;
			}

			res.sendStatus(err.statusCode || 500);
		}
	}
};