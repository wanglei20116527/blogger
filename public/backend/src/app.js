angular.module("Backend", ["ngRoute", "ngAnimate"]).config([
	'$locationProvider', 	
	'$routeProvider',

	function ($locationProvider, $routeProvider) {
		$locationProvider.hashPrefix('!');

		$routeProvider.when("/", {
			controller  : "indexCtrl",
			controllerAs: "indexCtrl",
			templateUrl : "/backend/static/templates/index.template.html"

		}).when("/picture", {
			controller  : "pictureCtrl",
			controllerAs: "pictureCtrl",
			templateUrl : "/backend/static/templates/picture.template.html"

		}).when("/article", {
			controller  : "articleCtrl",
			controllerAs: "articleCtrl",
			templateUrl : "/backend/static/templates/article.template.html"
			
		}).when("/profile", {
			controller  : "profileCtrl",
			controllerAs: "profileCtrl",
			templateUrl : "/backend/static/templates/profile.template.html"

		}).otherwise("/");
	}
]);