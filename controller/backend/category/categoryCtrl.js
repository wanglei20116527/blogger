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
			res.json({
				success: false,
				error: {
					code: 190000,
					message: err.stack
				}
			});
		});
	},

	addCategory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			name = ''
		} = req.body;

		if (!validation.checkCategoryName(name)) {
			res.json({
				success: false,
				error: {
					code: 190300,
					message: "category name invalid"
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
			res.json({
				success: false,
				error: {
					code: 190000,
					message: err.stack
				}
			});
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
					message: "category id invalid"
				}
			});
			return;
		}

		if (!validation.checkCategoryName(category.name)) {
			res.json({
				success: false,
				error: {
					code: 190300,
					message: "category name invalid"
				}
			});
			return;
		}

		category.user = user.id;

		categoryService.updateCategory(category).then((category)=>{
			res.json({
				success: true,
				data: {
					category: category
				}
			});
		}).catch(err=>{
			res.json({
				success: false,
				error: {
					code: 190000,
					message: err.stack
				}
			});
		});
	},

	deleteCategory: function (req, res) {
		let {
			user
		} = req.session.user;

		let {
			category
		} = req.query;

		try {
			category = JSON.parse(category);

		} catch (err) {
			res.json({
				success: false,
				error: {
					code: 190303,
					message: "category invalid"
				}
			});
			return;
		}

		if (!Number.isInteger(category.id)) {
			res.json({
				success: false,
				error: {
					code: 190302,
					message: "category id invalid"
				}
			});
			return;
		}

		category.user = user.id;
		
		categoryService.deleteCategory(category).then(()=>{
			res.json({
				success: true,
				data: {
					category: category
				}
			});
		}).catch(err=>{
			res.json({
				success: false,
				error: {
					code: 190000,
					message: err.stack
				}
			});
		});
	},
};