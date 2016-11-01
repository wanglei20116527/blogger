angular.module("Backend").service("Article", [
	"$http",
	"$q",

	function ($http, $q) {
		var BASE_URL = "/backend/article";

		this.getNumberOfArticles = function () {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/number";

				$http.get(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.number);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			}); 
		};

		this.getStatistic = function () {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/statistic";

				$http.get(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.statistic);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			}); 
		};

		this.getArticles = function (start, number, categoryId, isPublish) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "?start=" + start + "&number=" + number;

				if (categoryId != null) {
					url += "&category=" + categoryId;
				}

				if (isPublish != null) {
					url += "&isPublish=" + isPublish;
				}

				$http.get(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.addArticle = function (article, category) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL

				$http.put(url, {
					article : article,
					category: category
				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.article);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.updateArticle = function (article) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL

				$http.post(url, {
					article: article
				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.article);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.deleteArticle = function (article) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "?article=" + article.id;

				$http.delete(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.article);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};
	}
]);