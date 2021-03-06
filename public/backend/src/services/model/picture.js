angular.module("Backend").service("Picture", [
	"$http",
	"$q",
	"$timeout",
	function ($http, $q, $timeout) {
		var NUMBER   = 10;
		var BASE_URL = "/backend/picture";

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
			var promise = new $q(function (resolve, reject) {
				var url = BASE_URL + "/upload/segment";

				var data = new FormData();
				data.append("pictureId", id);
				data.append("picture", blob);

				var xhr = new XMLHttpRequest();
				
				xhr.open("POST", url, true);

				xhr.onreadystatechange = function () {
					if (xhr.readyState !== 4) {
						return;
					}

					if (xhr.status !== 200) {
						reject(new Error(xhr.statusText));
						return;
					}

					try {
						var ret = JSON.parse(xhr.responseText);

						if (!ret.success) {
							var errMsg = ret.error.message;
							console.error(errMsg);
							reject(new Error(errMsg)); 
							return;
						}
						
						resolve(ret.data.picture);
						
					} catch (err) {
						reject(err);
					}
				};

				if ("ontimeout" in xhr) {
					xhr.timeout   = 600000; // 10minutes
					xhr.ontimeout = function () {
						reject(new Error("timeout"));
					};
				}

				if ("onerror" in xhr) {
					xhr.onerror = function (err) {
						// use $timeout enable into angular context
						$timeout(function () {
							reject(err);
						});
					};
				}

				if ("upload" in xhr) {
					xhr.upload.onprogress = function (event) {
						if (!event.lengthComputable) {
							return;
						}

						// use $timeout enable into angular context
						$timeout(function () {
							var funcs = promise._progress || [];

							angular.forEach(funcs, function (func) {
								func && func(event.loaded);
							});
						});
					};
				}

				xhr.send(data);
			});

			promise.onProgress = function (callback) {
				if (promise._progress == null) {
					promise._progress = [];
				}

				promise._progress.push(callback || angular.noop);
			};

			return promise;
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

		this.getPictures = function (dirId, start, number) {
			start  = start  || 0;
			number = number || NUMBER;
			
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "?start=" + start + "&number=" + number;

				if (angular.isNumber(dirId) && parseInt(dirId) === dirId) {
					url += "&directory=" + dirId;
				}

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

		this.getNumberOfPictures = function (dirId) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/number";

				if (angular.isNumber(dirId) && parseInt(dirId) === dirId) {
					url += "?directory=" + dirId;
				}

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

		this.getNumbersOfPictures = function (ids) {
			var promises = [];

			angular.forEach(ids, function (id) {
				var p = this.getNumberOfPictures(id);
				promises.push(p);
			}.bind(this));

			return $q.all(promises);
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

		this.deletePictures = function (pictures) {
			var promises = [];
			
			angular.forEach(pictures, function (pic) {
				var p = this.deletePicture(pic);

				promises.push(p);
			}.bind(this));

			return $q.all(promises);
		};
	}
]);