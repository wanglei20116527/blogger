angular.module("Backend").service("User", [
	"$http",
	"$q",
	function ($http, $q) {
		var url = "/backend/user";

		this.update = function (user) {
		};

		this.get = function () {
			return new $q(function (resolve, reject){
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
					console.log(user);
					resolve(user);
				}).catch(function(err){
					reject(err);
				});	
			});	
		};
	}
]);