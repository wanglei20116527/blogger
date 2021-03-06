angular.module("Backend").service("Directory", [
	"$http",
	"$q",

	function ($http, $q) {
		var NUMBER   = 10;
		var BASE_URL = "/backend/directory";

		this.getDirectories = function (pDirId, start, number) {
			start  = start  || 0;
			number = number || NUMBER;

			return new $q(function (resolve, reject) {
				var url = BASE_URL + "?start=" + start + "&number=" + number;

				if (pDirId != null) {
					url += "&parentDirectory=" + pDirId;
				}

				$http.get(url).then(function (ret) {
					ret = ret.data;

					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					var dirs = ret.data.directories;

					angular.forEach(dirs, function (dir) {
						dir.thumbnail = "/backend/static/image/photo_dir.png";
					});

					resolve(dirs);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.getNumberOfDirectories = function (pDirId) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL + "/number";

				if (pDirId != null) {
					url += "?parentDirectory=" + pDirId;
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

		this.getNumbersOfDirectories = function (ids) {
			var promises = [];

			angular.forEach(ids, function (id) {
				var p = this.getNumberOfDirectories(id);
				promises.push(p); 

			}.bind(this));

			return $q.all(promises);
		};

		this.getDirectoriesByIds = function (ids) {
			return new $q(function (resolve, reject) {
				if (ids.length <= 0) {
					resolve([]);
					return;
				}
				
				var url = BASE_URL + "/ids/" + ids.join(" ");
				
				$http.get(url).then(function (ret) {
					ret = ret.data;

					if (!ret.success) {
						var errMsg = ret.error.message;
						console.error(errMsg);
						reject(new Error(errMsg)); 
						return;
					}

					var dirs = ret.data.directories;

					angular.forEach(dirs, function (dir) {
						if (angular.isObject(dir)) {
							dir.thumbnail = "/backend/static/image/photo_dir.png";
						}
					});

					resolve(dirs);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.addDirectory = function (dir, pDir) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL;

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

					var dir = ret.data.directory;
					dir.thumbnail = "/backend/static/image/photo_dir.png"

					resolve(dir);

				}).catch(function(err){
					console.error(err);
					reject(new Error("server error"));
				});
			});
		};

		this.updateDirectory = function (dir) {
			return new $q(function (resolve, reject) {
				var url = BASE_URL;

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

					var dir = ret.data.directory;
					dir.thumbnail = "/backend/static/image/photo_dir.png"
					resolve(dir);

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

		this.deleteDirectories = function (dirs) {
			var promises = [];

			angular.forEach(dirs, function (dir) {
				var p = this.deleteDirectory(dir);

				promises.push(p);
			}.bind(this));

			return $q.all(promises);
		};
	}
]);