angular.module("Backend").service("Picture", [
	"$http",
	"$q",
	function ($http, $q) {
		var BASE_URL = "/backend/picture";

		this.addPicture = function (picture, directory) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/upload";

				var data = new FormData();
				data.append("picture", picture);
				data.append("directory", directory.id);

				$http({
					method: "POST",
					data: data,
					url: url,
					headers: {
						"Content-Type": undefined
					}
				}).then(function (ret){
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.picture);
				}).catch(function (err) {
					console.error(err);
					reject(new Error("server error"));
				});
			});	
		};

		this.startUploadPictureSegment = function (picture, directory) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/upload/segment/start";

				$http.post(url, {
					picture: picture,
					directory: directory
				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.id);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.uploadPictureSegment = function (id, blob) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/upload/segment";

				var data = new FormData();
				data.append("pictureId", id);
				data.append("picture", blob);

				$http({
					method: "POST",
					data: data,
					url: url,
					headers: {
						"Content-Type": undefined
					}
				}).then(function (ret){
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.picture);
				}).catch(function (err) {
					console.error(err);
					reject(new Error("server error"));
				});
			});	
		};

		this.finishUploadPictureSegment = function (id) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/upload/segment/finish";

				$http.post(url, {
					pictureId: id,
				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}
					
					resolve(ret.data.picture);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.abortUploadPictureSegment = function (id) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/upload/segment/abort";

				$http.post(url, {
					pictureId: id
				}).then(function (ret) {
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

		this.getPictures = function (dir) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/directory/" + dir.id;

				$http.get(url).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.pictures);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});	
		};

		this.updatePicture = function (picture) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL

				$http.post(url, {
					picture: picture
				}).then(function (ret) {
					ret = ret.data;
					
					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					resolve(ret.data.picture);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.deletePicture = function (picture) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/" + picture.id;

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