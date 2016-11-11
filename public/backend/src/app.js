angular.module("Backend", ["ngRoute", "ngAnimate", "ui.bootstrap"]).config([
	'$locationProvider', 	
	'$routeProvider',

	function ($locationProvider, $routeProvider) {
		$locationProvider.html5Mode({
			enabled: false,
			requireBase: false
		
		}).hashPrefix('!');

		$routeProvider.when("/", {
			reloadOnSearch: false,
			controller  : "indexCtrl",
			controllerAs: "indexCtrl",
			templateUrl : "/backend/static/templates/index.template.html"
		})
		.when("/article/list", {
			reloadOnSearch: false,
			controller  : "articleListCtrl",
			controllerAs: "alc",
			templateUrl : "/backend/static/templates/article/article.list.html"
		})
		.when("/article/write", {
			reloadOnSearch: false,
			controller  : "articleWriteCtrl",
			controllerAs: "awl",
			templateUrl : "/backend/static/templates/article/article.edit.html"
		})
		.when("/article/category", {
			reloadOnSearch: false,
			controller  : "articleCategoryCtrl",
			controllerAs: "acc",
			templateUrl : "/backend/static/templates/article/article.category.html"
		})
		.when("/picture", {
			reloadOnSearch: false,
			controller  : "pictureCtrl",
			controllerAs: "pictureCtrl",
			templateUrl : "/backend/static/templates/picture.template.html"

		}).when("/profile", {
			reloadOnSearch: false,
			controller  : "profileCtrl",
			controllerAs: "profileCtrl",
			templateUrl : "/backend/static/templates/profile.template.html"

		}).otherwise("/");
	}
]);