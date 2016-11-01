angular.module("Backend").controller("articleListCtrl", [
	"$scope",
	"$q",
	"Category",
	"Article",


	function (
			$scope,
			$q,
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

		$scope.statistic = {
			total: 0,
			numOfPublished: 0
		};

		$scope.articleList = {
			show: true,
			
			total: 0,
			
			articles: [],
			
			curtPage: 0,
			
			numPerPage: NUMBER_PER_PAGE,

			categorySelector: {
				show: false,
				curtCategory: DEFAULT_CATEGORY,
			},

			publishSelector: {
				show: false,
				curtItem: PUBLISH_LIST[0]
			},

			showCategorySelector: function (show) {
				this.categorySelector.show = !!show;
			},

			updateCategory: function (category) {
				this.categorySelector.show = false;
				this.categorySelector.curtCategory = category;
			},

			showPublishSelector: function (show) {
				this.publishSelector.show = !!show;
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

				updateArticles(options).then(function (){
					$scope.isLoading = false;

					$scope.articleList.curtPage = 0;

					modifyArticleCategoryAttr();
					
				}).catch(function (err) {
					console.error(err);
					$scope.isLoading = false;
				});
			}
		};

		$scope.articleEdit = {
			show: false,
			article: null
		};

		$scope.categories = [];

		init();

		function init () {
			var promises = [];
			var p = null;

			p = initArticleStatistic();
			promises.push(p);

			p = initArticles();
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

		function initArticles () {
			return updateArticles({
				pageIndex: 0
			});
		}

		function initCategories () {
			return new $q(function (resolve, reject) {
				Category.getCategories().then(function (categories) {
					$scope.categories = [DEFAULT_CATEGORY].concat(categories || []);

					resolve();
				})
				.catch(reject);
			});
		}

		function updateArticles (options) {
			return new $q(function (resolve, reject) {
				var start     = (options.pageIndex || 0) * NUMBER_PER_PAGE;
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

					resolve();
				})
				.catch(reject);
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
	}
]);