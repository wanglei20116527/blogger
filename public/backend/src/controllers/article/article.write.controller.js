angular.module("Backend").controller("articleWriteCtrl", [
	"$window",
	"$scope",
	"$q",
	"Validation",
	"Category",
	"Article",

	function (
			$window,
			$scope,
			$q,
			Validation,
			Category,
			Article
		) {

		var isArticleSaved = false;

		$scope.isLoading    = true;
		$scope.categoires   = [];
		$scope.curtCategory = {};
		$scope.article      = {
			title: "",
			content: "",
			markdown: "",
			isPublish: false
		};

		$scope.onContentChange = function (html, markdown) {
			updateContent(html, markdown);
		};

		$scope.isCtgySelectorShow = false;

		$scope.showCtgySelector = function (show) {
			showCtgySelector(!!show);
		};

		$scope.toggleCtgySelector = function () {
			toggleCtgySelector();
		};

		$scope.changeCategory = function (category) {
			changeCategory(category);
			showCtgySelector(false);
		};

		$scope.togglePublishState = function () {
			updatePublishState(!$scope.article.isPublish);
		};

		$scope.saveArticle = function () {
			var article   = $scope.article;
			article.title = article.title.trim();

			if (!Validation.checkArticleTitle(article.title)) {
				console.error("article title " + article.title + "invalid");
				return;
			}

			saveArticle(article, $scope.curtCategory).then(function () {
				console.log("save article success");
			})
			.catch(function (err) {
				console.error(err);
			});
		};

		init();

		function init () {
			var promises = [];
			var p = null;

			p = initCategories();
			promises.push(p);

			$q.all(promises).then(function () {
				$scope.isLoading = false;

				if ($scope.categoires.length > 0) {
					changeCategory($scope.categoires[0]);
				}
			})
			.catch(function (err) {
				console.error(err);
			});
		}

		function initCategories () {
			return new $q(function (resolve, reject) {
				Category.getCategories().then(function (categoires) {
					$scope.categoires = categoires || [];

					resolve();
				})
				.catch(reject);
			});
		}

		function saveArticle (article, category) {
			article.date     = Date.now();
			article.category = category.id;

			return new $q(function (resolve, reject) {
				var p = null;

				if (isArticleSaved) {
					p = Article.updateArticle(article);
				} else {
					p = Article.addArticle(article, category);
				}

				p.then(function (article) {
					isArticleSaved = true;
					$scope.article = article;

					console.log(article);
					resolve();
				})
				.catch(reject);
			});
		}

		function updateContent (html, markdown) {
			$scope.article.content  = html;
			$scope.article.markdown = markdown;
		}

		function updatePublishState (isPublish) {
			$scope.article.isPublish = isPublish;
		};

		function changeCategory (category) {
			$scope.curtCategory     = category;
			$scope.article.category = category.id;
		}

		function showCtgySelector (show) {
			$scope.isCtgySelectorShow = !!show;
		}

		function toggleCtgySelector () {
			$scope.isCtgySelectorShow = !$scope.isCtgySelectorShow;
		}

		angular.element()

	}
]);