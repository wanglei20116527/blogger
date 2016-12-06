angular.module("Backend", ["ngRoute", "ui.bootstrap"]).config([
	'$locationProvider', 	
	'$routeProvider',

	function ($locationProvider, $routeProvider) {
		$locationProvider.html5Mode({
			enabled: false,
			requireBase: false
		
		}).hashPrefix('!');

		$routeProvider.when("/", {
			controller  : "indexCtrl",
			controllerAs: "indexCtrl",
			templateUrl : "/backend/static/templates/index/index.template.html"
		})
		.when("/article/list", {
			controller  : "articleListCtrl",
			controllerAs: "alc",
			templateUrl : "/backend/static/templates/article/article.list.html"
		})
		.when("/article/write", {
			controller  : "articleWriteCtrl",
			controllerAs: "awl",
			templateUrl : "/backend/static/templates/article/article.write.html"
		})
		.when("/article/category", {
			controller  : "articleCategoryCtrl",
			controllerAs: "acc",
			templateUrl : "/backend/static/templates/article/article.category.html"
		})
		.when("/picture", {
			controller  : "pictureCtrl",
			controllerAs: "pictureCtrl",
			templateUrl : "/backend/static/templates/picture/picture.template.html"

		})
		.when("/profile/basic", {
			controller  : "profileBasicCtrl",
			controllerAs: "profileBasicCtrl",
			templateUrl : "/backend/static/templates/profile/profile.basic.html"
		})
		.when("/profile/password", {
			controller  : "profilePasswordCtrl",
			controllerAs: "profilePasswordCtrl",
			templateUrl : "/backend/static/templates/profile/profile.password.html"
		})
		.when("/profile/photo", {
			controller  : "profilePhotoCtrl",
			controllerAs: "profilePhotoCtrl",
			templateUrl : "/backend/static/templates/profile/profile.photo.html"
		})
		.otherwise("/");
	}
]);