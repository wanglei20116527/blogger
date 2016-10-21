angular.module("Backend").service("Category", [
	"$http",
	"$q",

	function ($http, $q) {
		var BASE_URL = "/backend/category";

		this.getCategories = function () {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/all";

				$http.get(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.categories);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.addCategory = function (name) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL;

				$http.put(url, {
					name: name

				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.category);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.deleteCategory = function (category) {
			return new $q(function (resolve, reject) {
				var categoryJSON = JSON.stringify(category);
				var url = BASE_URL + "?category=" + categoryJSON;

				$http.delete(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.category);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.updateCategory = function (category) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL;

				$http.post(url, {
					category: category

				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.category);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};
	}
]);