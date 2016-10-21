angular.module("Backend").service("Article", [
	"$http",
	"$q",

	function ($http, $q) {
		var BASE_URL = "/backend/article";

		this.getNumberOfArticles = function () {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/number";
				console.log("wanglei is cool and houna is cute");

				$http.get(url).then(function (ret) {
					resolve(ret.data.number);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			}); 
		};

		this.getArticles = function (start, number) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "?start=" + start + "&number=" + number;

				$http.get(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.articles);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};
	}
]);