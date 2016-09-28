angular.module("Backend", ["ngRoute"]).config([
	'$locationProvider', 	
	'$routeProvider',

	function ($locationProvider, $routeProvider) {
		$locationProvider.hashPrefix('!');

		$routeProvider.when("/index", {
			template: "index"
		}).when("/picture", {
			template: "picture"
		}).when("/category", {
			template: "category"
		}).when("/article", {
			template: "article"
		}).when("/profile", {
			template: "profile"
		}).otherwise("/index");
	}
]);