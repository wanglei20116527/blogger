angular.module("Backend").service("User", [
	"$http",
	"$q",
	"$timeout",

	function ($http, $q, $timeout) {
		var BASE_URL = "/backend/user";

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

					!!user.photo && (user.photo += "?a=" + Date.now());

					resolve(user);

				}).catch(reject);	
			});	
		};

		this.update = function (user) {
		};

		this.updatePhoto = function (imageBase64) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/photo";
				$http.post(url, {
					image: imageBase64
				}).then(function (ret) {
					ret = ret.data;

					if (!ret.success) {
						var errMsg = ret.error.message;
						reject(new Error(errMsg)); 
						return;
					}

					var image = ret.data.image;

					image && (image += "?a=" + Date.now());

					resolve(image);

				}).catch(reject)
			});
		};

		this.updatePassword = function (oP, nP, cP) {
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