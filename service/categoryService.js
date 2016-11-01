const database      = require("../model/database");
const articleModel  = require("../model/article");
const categoryModel = require("../model/category");

module.exports = {
	isCategoryExistByUserAndName: function (user, name) {
		return database.executeTemplate(conn=>{
			return categoryModel.isCategoryExistByUserAndName(conn, user, name);
		});
	},

	isCategoryExistByUserAndCategory: function (user, category) {
		return database.executeTemplate(conn=>{
			return categoryModel.isCategoryExistByUserAndCategory(conn, user, category);
		});
	},

	getCategoriesByUser: function (user) {
		return database.executeTemplate(conn=>{
			return categoryModel.getCategoriesByUser(conn, user);
		});
	},

	addCategory: function (category) {
		return database.executeTemplate(conn=>{
			return categoryModel.add(conn, category);
		});
	},

	updateCategory: function (category) {
		return database.executeTemplate(conn=>{
			return categoryModel.update(conn, category);
		});
	},

	deleteCategory: function (category) {
		// return database.executeTemplate(conn=>{
		// 	let promises = [];
		// 	let p = null;

		// 	p = categoryModel.delete(conn, category);
		// 	promises.push(p);

		// 	p = articleModel.deleteByCategory(conn, category);
		// 	promises.push(p);

		// 	return Promise.all(promises);
		// });

		return this.deleteCategories([category]);
	},

	deleteCategories: function (categories) {
		return database.executeTemplate(conn=>{
			if (categories.length <= 0) {
				resolve();
				return;
			}

			let promises = [];
			
			for (let category of categories) {
				let p = deleteCategory(conn, category);
				promises.push(p);
			}

			return Promise.all(promises);
		});

		function deleteCategory (conn, category) {
			let promises = [];
			let p = null;

			p = categoryModel.delete(conn, category);
			promises.push(p);

			p = articleModel.deleteByCategory(conn, category);
			promises.push(p);

			return Promise.all(promises);
		}
	}
};

