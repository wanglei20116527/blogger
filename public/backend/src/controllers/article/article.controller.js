angular.module("Backend").controller("articleCtrl", [
	"$rootScope",
	"$scope",
	"$q",
	"Config",
	"Validation",
	"Category",
	"Article",

	function ($rootScope, $scope, $q, Config, Validation, Category, Article) {
		$rootScope.$emit("pageChanged", {
			page: "article",
		});

		$scope.loading  = true;

		var item = $scope.item = {
			items: {
				article : "article",
				category: "category"
			},

			activeItem: null,
		};
		item.activeItem = item.items.article;

		$scope.dialog = {
			addCategoryDialog: {
				show: false,
				
				close: function () {
					this.show = false;
				},

				cancel: function () {
					this.show = false;
				},

				confirm: function (name) {
					this.show = false;

					if (!Validation.checkCategory(name)) {
						sendErrorMessage("category name invalid");
						return;
					}

					addCategory(name.trim()).then(function(){
						self.show     = false;
						sendSuccessMessage("add category success");

					}).catch(function (err) {
						sendErrorMessage(err.message);
					});
				},
			},

			updateCategoryDialog: {
				show: false,
				category: null,
				
				close: function () {
					this.show     = false;
					this.category = null;
				},

				cancel: function () {
					this.show     = false;
					this.category = null;
				},

				confirm: function (category) {
					var self = this;
					var name = category.name.trim();

					if (!Validation.checkCategory(name)) {
						sendErrorMessage("category name invalid");
						return;
					}

					updateCategory(category).then(function(){
						self.show     = false;
						self.category = null;
						sendSuccessMessage("update category success");

					}).catch(function (err) {
						sendErrorMessage(err.message);
					});
				}
			},

			deleteCategoryDialog: {
				show: false,
				title: "Delete Category",
				message: "Are you confirm to delete this category?",

				category: {
					id: 12,
					name: "wanglei567",
					user: 1
				},

				close: function () {
					this.show = false;
				},

				cancel: function () {
					this.show = false;
				},

				confirm: function () {
					var seld     = this;
					var category = this.category;

					deleteCategory(category).then(function () {
						self.show = false;
						self.category = null;
						sendSuccessMessage("delete category success");
					}).catch(function (err) {
						sendErrorMessage(err.messages);
					});
				},
			},
		};

		var _category = $scope.category = {
			categories: []
		};

		var _article = $scope.article  = {
			numberPerPage: 10,
			curtPage: 0,
			total  : 0,
			articles: []
		};

		$scope.itemChange = function (item) {
			$scope.item.activeItem = item;
		};

		init().then(function () {
			$scope.loading = false;
		
		}).catch(function (err) {
			sendErrorMessage(err.message);
		});

		function init () {
			let promises = [];
			let p = null;

			p = initArticles();
			promises.push(p);

			p = initCategories();
			promises.push(p);

			return $q.all(promises);
		}

		function initArticles () {
			return new $q(function (resolve, reject) {
				var startIndex = _article.curtPage * _article.numberPerPage;
				var number     = _article.numberPerPage;

				Article.getArticles(startIndex, number).then(function (ret) {
					_article.total    = ret.total;
					_article.articles = ret.articles;

					resolve();
				}).catch(reject);
			});
		}

		function initCategories () {
			return new $q(function (resolve, reject) {
				Category.getCategories().then(function (categories) {
					_category.categories = categories || [];
					resolve();
				}).catch(reject);
			});
		}

		function addCategory (name) {
			return new $q(function (resolve, reject) {
				Category.addCategory(name).then(function(category){
					var categories = _category.categories || [];

					categories.push(category);

					resolve();
				}).catch(reject);
			});
		}

		function updateCategory (category) {
			return new $q(function (resolve, reject) {
				Category.updateCategory(category).then(function(category){
					var categories = _category.categories || [];

					for (var i = 0, len = categories.length; i < len; ++i) {
						if (categories[i].id === category.id) {
							categories[i] = category;
							break;
						}
					}

					resolve();
				}).catch(reject);
			});
		}

		function deleteCategory (category) {
			return new $q(function (resolve, reject) {
				Category.deleteCategory(category).then(function(){
					var categories = _category.categories || [];

					for (var i = 0, len = categories.length; i < len; ++i) {
						if (categories[i].id === category.id) {
							categories.splice(i, 1);
							break;
						}
					}
					
					resolve();
				}).catch(reject);
			});
		}

		function addArticle (article, category) {
			return new $q(function (resolve, reject) {
				Article.addArticle(article, category).then(function (article) {
					console.log("add article");
					console.log(article);
					resolve();
				}).catch(reject);
			});
		}

		function updateArticle (article) {
			return new $q(function (resolve, reject) {
				Article.updateArticle(article).then(function (article) {
					console.log("update article");
					console.log(article);
					resolve();
				}).catch(reject);
			});
		}

		function deleteArticle (article) {
			return new $q(function (resolve, reject) {
				Article.deleteArticle(article).then(function (article) {
					console.log("deleteArticle article");
					console.log(article);
					resolve();
				}).catch(reject);
			});
		}

		function sendSuccessMessage (msg) {
			var msgObj = {
				type: Config.MESSAGE.SUCCESS,
				msg: msg
			};

			$rootScope.$emit("message", msgObj);
		}

		function sendErrorMessage (msg) {
			var msgObj = {
				type: Config.MESSAGE.ERROR,
				msg: msg
			};

			$rootScope.$emit("message", msgObj);
		}

		(function(){
			// updateArticle({
			// 	id: 0,
			// 	title: "hello word1",
			// 	content: "wanglei is cool and houna is cute",
			// 	isPublish: "1",
			// 	category: 5,
			// 	author: 1
			// });

			// deleteArticle({
			// 	id: 0,
			// 	title: "hello word",
			// 	content: "wanglei is cool and houna is cute",
			// 	isPublish: "1",
			// 	category: 5,
			// 	author: 1
			// });

			// addArticle({
			// 	title: "hello word",
			// 	content: "wanglei is cool and houna is cute",
			// 	isPublish: "0"
			// }, {
			// 	id: 14	
			// });

			// addCategory("wanglei loves houna");
			
			// updateCategory({
			// 	id: 13,
			// 	user: 1,
			// 	name: "wanglei1"
			// })

			// deleteCategory({
			// 	id: 14
			// });
		})();
	}
]);