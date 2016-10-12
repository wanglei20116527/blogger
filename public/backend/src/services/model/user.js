angular.module("Backend").service("User", [
	"$http",
	"$q",
	function ($http, $q) {
		var BASE_URL = "/backend/user";

		this.update = function (user) {
		};

		this.updatePassword = function (oP, nP, cP) {
		};

		this.get = function () {
			return new $q(function (resolve, reject){
				var url = BASE_URL;

				$http.get(url).then(function(ret){
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						reject(new Error(errMsg)); 
						return;
					}

					var defaultData = {
						email: "",
						phone: "",
						about: "",
						photo: "/backend/static/image/defaultPhoto.jpg"
					};

					var user = ret.data.user;

					for (var key in defaultData) {
						if (!user[key]) {
							user[key] = defaultData[key];
						}
					}
					resolve(user);
				}).catch(reject);	
			});	
		};

		this.logout = function () {
			return new $q(function(resolve, reject){
				var url = BASE_URL + "/logout";

				$http.post(url).then(function(ret){
					ret = ret.data;

					if (!ret.success) {
						var errMsg = ret.error.message;
						reject(new Error(errMsg)); 
						return;
					}

					resolve();

				}).catch(reject);
			});
		};
	}
]);