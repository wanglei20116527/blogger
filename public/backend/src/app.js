angular.module("Backend", ["ngRoute", "ngAnimate", "ui.bootstrap"]).config([
	'$locationProvider', 	
	'$routeProvider',

	function ($locationProvider, $routeProvider) {
		$locationProvider.hashPrefix('!');

		$routeProvider.when("/", {
			controller  : "indexCtrl",
			controllerAs: "indexCtrl",
			templateUrl : "/backend/static/templates/index.template.html"

		})
		.when("/article/list", {
			controller  : "articleListCtrl",
			controllerAs: "alc",
			templateUrl : "/backend/static/templates/article/article.list.html"
		})
		.when("/article/write", {
			controller  : "articleWriteCtrl",
			controllerAs: "awl",
			templateUrl : "/backend/static/templates/article/article.edit.html"
		})
		.when("/article/category", {
			controller  : "articleCategoryCtrl",
			controllerAs: "acc",
			templateUrl : "/backend/static/templates/article/article.category.html"
		})
		.when("/picture", {
			controller  : "pictureCtrl",
			controllerAs: "pictureCtrl",
			templateUrl : "/backend/static/templates/picture.template.html"

		}).when("/profile", {
			controller  : "profileCtrl",
			controllerAs: "profileCtrl",
			templateUrl : "/backend/static/templates/profile.template.html"

		}).otherwise("/");
	}
]);