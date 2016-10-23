angular.module("Backend").service("Directory", [
	"$http",
	"$q",

	function ($http, $q) {
		var BASE_URL = "/backend/directory";

		this.addDirectory = function (dir, pDir) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL

				$http.put(url, {
					directory: dir,
					parentDirectory: pDir
				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.directory);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.updateDirectory = function (dir) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL

				$http.post(url, {
					directory: dir
				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.directory);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});	
		};

		this.deleteDirectory = function (dir) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "?directory=" + dir.id;

				$http.delete(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve();

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});		
		};
	}
]);