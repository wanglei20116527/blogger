angular.module("Backend").controller("articleListCtrl", [
	"$scope",
	"$q",
	"User",
	"Category",
	"Article",

	function (
			$scope,
			$q,
			User,
			Category,
			Article
		) {

		var NUMBER_PER_PAGE  = 10;

		var DEFAULT_CATEGORY = {
			id: -1,
			name: "All Category"
		};

		var PUBLISH_LIST = [
			{
				name: "All"
			},

			{
				name: "Published"
			},

			{
				name: "UnPublished"
			}
		];

		$scope.isLoading = true;

		$scope.publishList = PUBLISH_LIST;

		$scope.user = {};

		$scope.deleteArticleDialogOption = {
			show: false,

			article: null,
			
			title: "Delete Article",

			buttons: [
				{
					text: "Cancel",
					style: {
						color: "#fff",
						backgroundColor: "#666"
					},
					onClick: function () {
						console.log("close delete article");
						closeDeleteArticleDialog();
					}
				},

				{
					text: "Confirm",
					style: {
						color: "#fff",
						backgroundColor: "#2196F3"
					},
					onClick: function () {
						var article = $scope.deleteArticleDialogOption.article;

						deleteArticle(article).then(function () {
							closeDeleteArticleDialog();
							console.log("deleteArticle success");
						})
						.catch(function (err) {
							console.error(err);
						});
					}
				}
			],

			onClose: function () {
				this.show = false;
			}
		};

		$scope.statistic = {
			total: 0,
			numOfPublished: 0
		};

		$scope.articleList = {
			show: true,
			
			total: 0,
			
			articles: [],
			
			curtPage: 1,
			
			numPerPage: NUMBER_PER_PAGE,

			categorySelector: {
				show: false,
				curtCategory: DEFAULT_CATEGORY,
			},

			publishSelector: {
				show: false,
				curtItem: PUBLISH_LIST[0]
			},

			pageChanged: function () {
				$scope.isLoading = true;

				var options =  {
					start: (this.curtPage - 1) * NUMBER_PER_PAGE
				};

				var publishItem  = this.publishSelector.curtItem;
				
				if (publishItem === PUBLISH_LIST[1]) {
					options.isPublish = true;

				} else if (publishItem === PUBLISH_LIST[2]) {
					options.isPublish = false;
				}

				var curtCategory = this.categorySelector.curtCategory;

				if (curtCategory !== DEFAULT_CATEGORY) {
					options.category = curtCategory.id;
				}

				updateArticleList(options).then(function (){
					$scope.isLoading = false;

					modifyArticleCategoryAttr();
					
				}).catch(function (err) {
					console.error(err);
					$scope.isLoading = false;
				});
			},

			showCategorySelector: function (show) {
				this.categorySelector.show = !!show;
			},

			toggleCategorySelector: function () {
				this.categorySelector.show = !this.categorySelector.show;
			},

			updateCategory: function (category) {
				this.categorySelector.show = false;
				this.categorySelector.curtCategory = category;
			},

			showPublishSelector: function (show) {
				this.publishSelector.show = !!show;
			},

			togglePublishSelector: function () {
				this.publishSelector.show = !this.publishSelector.show;
			},

			updatePublishSelecorItem: function (item) {
				this.publishSelector.show = false;
				this.publishSelector.curtItem = item;
			},

			filtrateArticles: function () {
				$scope.isLoading = true;

				var options =  {
					start: 0
				};

				var publishItem  = this.publishSelector.curtItem;
				
				if (publishItem === PUBLISH_LIST[1]) {
					options.isPublish = true;

				} else if (publishItem === PUBLISH_LIST[2]) {
					options.isPublish = false;
				}

				var curtCategory = this.categorySelector.curtCategory;

				if (curtCategory !== DEFAULT_CATEGORY) {
					options.category = curtCategory.id;
				}

				updateArticleList(options).then(function (){
					$scope.isLoading = false;

					$scope.articleList.curtPage = 1;

					modifyArticleCategoryAttr();
					
				}).catch(function (err) {
					console.error(err);
					$scope.isLoading = false;
				});
			},

			editArticle: function (article) {
				this.show = false;

				article = angular.copy(article);

				$scope.articleEdit.show = true;
				$scope.articleEdit.article = article;
				$scope.articleEdit.categorySelector.curtCategory = article.category;
			},

			deleteArticle: function (article) {
				openDeleteArticleDialog(article);
			}
		};

		$scope.articleEdit = {
			show: false,
			
			article: null,

			categorySelector: {
				show: false,
				curtCategory: null,
			},

			backToArticleList: function () {
				this.show = false;
				this.article = null;

				$scope.articleList.show = true;
			},

			showCategorySelector: function (show) {
				this.categorySelector.show = !!show;
			},

			toggleCategorySelector: function () {
				this.categorySelector.show = !this.categorySelector.show;
			},

			togglePublishState: function () {
				this.article.isPublish = !this.article.isPublish;
			},

			changeCategory: function (category) {
				this.article.category = category;

				this.categorySelector.show = false;
				this.categorySelector.curtCategory = category;
			},

			onContentChange: function (html, markdown) {
				if (this.article == null) {
					return;
				}

				this.article.content  = html;
				this.article.markdown = markdown;
			},

			updateArticle: function () {
				debugger;
				updateArticle(this.article).then(function () {
					console.log("update article success");
				}).catch(function (err) {
					console.error(err);
				});
			},
		};

		$scope.defaultCategory = DEFAULT_CATEGORY;

		$scope.categories = [];

		init();

		function init () {
			var promises = [];
			var p = null;

			p = initUser();
			promises.push(p);

			p = initArticleStatistic();
			promises.push(p);

			p = initArticleList();
			promises.push(p);

			p = initCategories();
			promises.push(p);

			$q.all(promises).then(function () {
				modifyArticleCategoryAttr();

				$scope.isLoading = false;

			}).catch(function (err) {
				console.error(err);
				$scope.isLoading = false;
			});
		}

		function initUser () {
			return new $q(function (resolve, reject) {
				User.get().then(function (user) {
					$scope.user = user;

					resolve();
				})
				.catch(reject);
			});
		}

		function initArticleStatistic () {
			return new $q(function (resolve, reject) {
				Article.getStatistic().then(function (statistic) {
					$scope.statistic = angular.merge({
						total: 0,
						numOfPublished: 0
					}, statistic || {});

					resolve();
				})
				.catch(reject);
			});
		}

		function initArticleList () {
			return updateArticleList({
				start: 0
			});
		}

		function initCategories () {
			return new $q(function (resolve, reject) {
				Category.getCategories().then(function (categories) {
					$scope.categories = categories || [];

					resolve();
				})
				.catch(reject);
			});
		}

		function updateArticleList (options) {
			return new $q(function (resolve, reject) {
				var start     = options.start || 0;
				var number    = NUMBER_PER_PAGE;
				var category  = options.category;
				var isPublish = options.isPublish;

				if (!angular.isNumber(category) || parseInt(category) !== category) {
					category = null;
				}

				if (isPublish !== true && isPublish !== false) {
					isPublish = null;
				}

				Article.getArticles(start, number, category, isPublish).then(function(data){
					$scope.articleList.total    = data.total    || 0;
					$scope.articleList.articles = data.articles || [];

					var articles = $scope.articleList.articles;

					for (var i = 0, len = articles.length;  i < len; ++i) {
						var article = articles[i];

						article.index = start + i + 1;
						article.date  = new Date(article.date);
					}

					resolve();
				})
				.catch(reject);
			});
		}

		function updateArticle (article) {
			return new $q(function (resolve, reject) {
				article = angular.copy(article);

				var category = article.category;

				article.date = article.date.getTime();
				article.category = category.id;

				delete article.index;

				Article.updateArticle(article).then(function (article) {
					var articles = $scope.articleList.articles;

					for (var i = 0, len = articles.length; i < len; ++i) {
						var tmpArticle = articles[i];

						if (tmpArticle.id === article.id) {
							if (tmpArticle.isPublish != article.isPublish) {

								if (tmpArticle.isPublish) {
									$scope.statistic.numOfPublished--;
								} else {
									$scope.statistic.numOfPublished++;
								}
							}
							article.index = i + 1;
							article.category = category;
							article.date = new Date(article.date);
							articles[i] = article;
							break;
						}
					}

					resolve();
				})
				.catch(reject);
			});

		
		}

		function deleteArticle (article) {
			article = angular.copy(article);

			article.date = article.date.getTime();
			article.category = article.category.id;

			delete article.index;

			return new $q(function (resolve, reject) {
				Article.deleteArticle(article).then(function () {
					$scope.statistic.total--;

					if (article.isPublish) {
						$scope.statistic.numOfPublished--;
					}

					var options = {};

					var articleList = $scope.articleList;

					var curtPage = articleList.curtPage;
					if (articleList.articles.length <= 1) {
						curtPage = curtPage - 1;
					}
					options.start = (curtPage - 1) * NUMBER_PER_PAGE;

					var publishItem = articleList.publishSelector.curtItem;
					if (publishItem === PUBLISH_LIST[1]) {
						options.isPublish = true;

					} else if (publishItem === PUBLISH_LIST[2]) {
						options.isPublish = false;
					}

					var curtCategory = articleList.categorySelector.curtCategory;

					if (curtCategory !== DEFAULT_CATEGORY) {
						options.category = curtCategory.id;
					}

					updateArticleList(options).then(function () {
						articleList.curtPage = curtPage;

						modifyArticleCategoryAttr();

						resolve();
					}).catch(reject)


				}).catch(reject);
			});
		}

		function modifyArticleCategoryAttr () {
			var articles   = $scope.articleList.articles;
			var categories = $scope.categories;

			for (var i = 0, ii = articles.length; i < ii; ++i) {
				var article = articles[i];

				for (var j = 0, jj = categories.length; j < jj; ++j) {
					var category = categories[j];

					if (category.id === article.category) {
						article.category = category;
					}
				}
			}
		}


		function openDeleteArticleDialog (article) {
			$scope.deleteArticleDialogOption.show = true;
			$scope.deleteArticleDialogOption.article = article;
		}

		function closeDeleteArticleDialog () {
			$scope.deleteArticleDialogOption.show = false;
			$scope.deleteArticleDialogOption.article = null;
		}
	}
]);