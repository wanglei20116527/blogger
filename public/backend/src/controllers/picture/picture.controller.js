angular.module("Backend").controller("pictureCtrl", [
	"$rootScope",
	"$scope",
	"$q",
	"$location",
	"$document",
	"Validation",
	"Directory",
	"Picture",
	"PictureUploader",

	function (
			$rootScope, 
			$scope, 
			$q,
			$location,
			$document,
			Validation,
			Directory,
			Picture,
			PictureUploader) {

		$rootScope.$emit("pageChanged", {
			page: "picture",
		});

		var DEFAULT_PATH_DIR = {
			name: 'All'
		};

		$scope.contextMenu = {
			dir: {
				dir: null,
				
				_show: false,

				show: function (event, dir) {
					event.preventDefault();

					this.dir  = angular.copy(dir);
					this._show = true;
				},
				
				hide: function () {
					this.dir   = null;
					this._show = false;
				},

				update: function () {
					openUpdateDirDialog(this.dir);
					this.hide();
				},

				delete: function () {
					openDeleteDirDialog(this.dir);
					this.hide();
				}
			}
		};

		$scope.isLoading = true;

		$scope.path = [];

		$scope.dir = {
			dirs: [],
		};

		$scope.picture = {
			pictures: [],
		};

		$scope.createDirDialogConfig = {
			show: false,

			name: "",

			title: "Create Directory",

			buttons: [
				{
					text: "Cancel",
					style: {
						color: "#fff",
						backgroundColor: "#666"
					},
					onClick: function () {
						closeCreateDirDialog();
					}
				},

				{
					text: "Confirm",
					style: {
						color: "#fff",
						backgroundColor: "#2196F3"
					},
					onClick: function () {
						var name = $scope.createDirDialogConfig.name || "";

						createDir(name.trim()).then(function () {
							console.log("create dir success");

							closeCreateDirDialog();
						}).catch(function (err) {
							console.error(err);
						});
					}
				}
			],

			onClose: function () {
				closeCreateDirDialog();
			}
		};

		$scope.updateDirDialogConfig = {
			show: false,

			dir: null,

			title: "Update Directory",

			buttons: [
				{
					text: "Cancel",
					style: {
						color: "#fff",
						backgroundColor: "#666"
					},
					onClick: function () {
						closeUpdateDirDialog();
					}
				},

				{
					text: "Confirm",
					style: {
						color: "#fff",
						backgroundColor: "#2196F3"
					},
					onClick: function () {
						var dir = $scope.updateDirDialogConfig.dir;

						if (dir == null) {
							closeUpdateDirDialog();
							return;
						}

						updateDir(dir).then(function () {
							closeUpdateDirDialog();
						})
						.catch(function (err) {
							console.error(err);
						});
					}
				}
			],

			onClose: function () {
				closeUpdateDirDialog();
			}
		};

		$scope.deleteDirDialogConfig = {
			show: false,

			dir: null,

			title: "Delete Directory",

			buttons: [
				{
					text: "Cancel",
					style: {
						color: "#fff",
						backgroundColor: "#666"
					},
					onClick: function () {
						closeDeleteDirDialog();
					}
				},

				{
					text: "Confirm",
					style: {
						color: "#fff",
						backgroundColor: "#2196F3"
					},
					onClick: function () {
						var dir = $scope.deleteDirDialogConfig.dir;

						if (dir == null) {
							closeDeleteDirDialog();
							return;
						}

						deleteDir(dir).then(function () {
							closeDeleteDirDialog();
						})
						.catch(function (err) {
							console.error(err);
						});
					}
				}
			],

			onClose: function () {
				closeDeleteDirDialog();
			}
		};

		$scope.uploadPicturesDialogConfig = {
			show: false,

			pictures: [],
		};

		$scope.openCreateDirDialog = function () {
			openCreateDirDialog();
		};

		$scope.openUpdateDirDialog = function (dir) {
			openUpdateDirDialog(dir);
		};

		$scope.openDeleteDirDialog = function (dir) {
			openDeleteDirDialog(dir);
		};

		$scope.enterToDir = function (dir) {
			enterToDir(dir).then(function () {
				console.log("enter to dir success");
			})
			.catch(function (dir) {
				console.error(dir);
			});
		};

		$scope.changeToDir = function (dir) {
			var path = $scope.path, 
				len  = path.length;

			if (dir === path[len - 1]) {
				return;
			}

			changeToDir(dir).then(function () {
				console.log("change to dir success");
			})
			.catch(function (err) {
				console.error(err);
			});
		};

		$scope.backToParentDir = function () {
			var path = $scope.path;
			
			if (path.length < 2) {
				console.error("curt path length less then 2");
				return;
			}
			
			var pDir = path[path.length - 2];
			
			changeToDir(pDir).then(function () {
				console.log("back to parent dir success");
			})
			.catch(function (err) {
				console.error(err);
			});
		};

		$scope.closeUploadPicturesDialog = function () {
			closeUploadPicturesDialog();
		};

		$scope.abortUploadPicture = function (picture) {
			abortUploadPicture(picture).then(function () {
				console.log("upload picture success");
			})
			.catch(function (err) {
				console.error(err);
			});
		};

		$scope.onPictureInputChanged = function (event) {
			var files    = event.target.files;
			var pictures = [];

			for (var i = 0, len = files.length; i < len; ++i) {
				var file = files[i];
				if (Validation.checkImageMimeType(file.type)) {
					pictures.push(file);
				}
			}

			debugger;

			$scope.$apply(function () {
				uploadPictures(pictures);
			});

			event.target.value = null;
		};

		init();

		function init () {
			let promises = [];
			let p = null;

			p = initDirs();
			promises.push(p);

			p = initPictures();
			promises.push(p);

			$q.all(promises).then(function () {
				$scope.isLoading = false;
			})
			.catch(function (err) {
				console.error(err);

				$scope.isLoading = false;
			});

			initPictureUploadEvents();

			$scope.$on("$destroy", function () {
				offPictureUploadEvents();
			});
		}

		function initDirs (pDir) {
			return new $q(function (resolve, reject) {
				Directory.getDirectories(pDir).then(function (dirs) {
					$scope.dir.dirs = dirs;

					resolve();
				}).catch(reject);
			});
		}

		function createDir (name) {
			return new $q(function (resolve, reject) {
				name = (name || "").trim();

				if (!Validation.checkDirectoryName(name)) {
					reject(new Error("dir name " + name + " invalid"));
					return;
				}

				var dirs = $scope.dir.dirs;

				for (var i = 0, len = dirs.length; i < len; ++i) {
					var dir = dirs[i];

					if (dir.name === name) {
						reject(new Error("dir " + name + " already exist"));
						return;
					}
				}

				var dir = {
					name: name
				};

				var path = $scope.path;

				var pDir = path.length > 1 ? path[path.length - 1] : void 0;

				Directory.addDirectory(dir, pDir).then(function (dir) {
					var dirs = $scope.dir.dirs;

					dirs.unshift(dir);

					resolve();
				}).catch(reject);
			});
		}

		function deleteDir (dir) {
			return new $q(function (resolve, reject) {
				Directory.deleteDirectory(dir).then(function () {
					var dirs = $scope.dir.dirs;

					for (var i = 0, len = dirs.length; i < len; ++i) {
						if (dir.id === dirs[i].id) {
							dirs.splice(i, 1);
							break;
						}
					}

					resolve();
				})
				.catch(reject);
			});
		}

		function updateDir (dir) {
			return new $q(function (resolve, reject) {
				Directory.updateDirectory(dir).then(function (dir) {
					var dirs = $scope.dir.dirs;

					for (var i = 0, len = dirs.length; i < len; ++i) {
						if (dir.id === dirs[i].id) {
							dirs[i] = dir;
							break;
						}
					}

					resolve();
				})
				.catch(reject);
			});
		}

		function enterToDir (dir) {
			return new $q(function (resolve, reject) {
				var promises = [];
				var p = null;

				p = initDirs(dir);
				promises.push(p);

				p = initPictures(dir);
				promises.push(p);

				$q.all(promises).then(function () {
					var path = $scope.path;

					if (path.length <= 0) {
						path.push(DEFAULT_PATH_DIR);
					}

					path.push(dir);

					resolve();
				})
				.catch(reject);
			});
		}

		function changeToDir (dir) {
			return new $q(function (resolve, reject) {
				var promises = [];
				var p = null;

				if (dir === DEFAULT_PATH_DIR) {
					p = initDirs();
					promises.push(p);

					p = initPictures();
					promises.push(p);

				} else {
					p = initDirs(dir);
					promises.push(p);

					p = initPictures(dir);
					promises.push(p);
				}

				$q.all(promises).then(function () {
					if (dir === DEFAULT_PATH_DIR) {
						$scope.path = [];
						resolve();
						return;	
					}

					var tPath = [];
					var path  = $scope.path;

					for (var i = 0, len = path.length; i < len; ++i) {
						var dirItem = path[i];
						tPath.push(dirItem);

						if (dirItem === dir) {
							break;
						}
					}

					$scope.path = tPath;
					
					resolve();
				})
				.catch(reject);
			});
		}

		function initPictures (pDir) {
			// return new $q(function (resolve, reject) {
			// 	Picture.getPictures(pDir).then(function (pictures) {
			// 		$scope.picture.pictures = pictures || [];

			// 		resolve();
			// 	})
			// 	.catch(reject);
			// });

			return $q.resolve();
		}

		function initPictureUploadEvents () {
			PictureUploader.onError(onErrorUploadPicture);
			PictureUploader.onAbort(onAbortUploadPicture);
			PictureUploader.onProgress(onProgressUploadPicture);
			PictureUploader.onComplete(onCompleteUploadPicture);
		}

		function　offPictureUploadEvents () {
			PictureUploader.offError(onErrorUploadPicture);
			PictureUploader.offAbort(onAbortUploadPicture);
			PictureUploader.offProgress(onProgressUploadPicture);
			PictureUploader.offComplete(onCompleteUploadPicture);
		}

		function onProgressUploadPicture (uploadId, progress) {
			var config = $scope.uploadPicturesDialogConfig;
			var pics   = config.pictures;

			for (var i = 0, len = pics.length; i < len; ++i) {
				var pic = pics[i];

				if (pic.uploadId === uploadId) {
					pic.progress = progress;
					break;
				}
			}
		}

		function onCompleteUploadPicture (uploadId) {
			var config = $scope.uploadPicturesDialogConfig;
			var pics   = config.pictures;

			for (var i = 0, len = pics.length; i < len; ++i) {
				var pic = pics[i];

				if (pic.uploadId === uploadId) {
					pic.complete  = true;
					pic.uploading = false;
					break;
				}
			}
		}

		function onErrorUploadPicture (err, uploadId) {
			var config = $scope.uploadPicturesDialogConfig;
			var pics   = config.pictures;

			for (var i = 0, len = pics.length; i < len; ++i) {
				var pic = pics[i];

				if (pic.uploadId === uploadId) {
					pic.error     = true;
					pic.uploading = false;
					break;
				}
			}

			console.error(err);
		}

		function onAbortUploadPicture (uploadId) {
			var config = $scope.uploadPicturesDialogConfig;
			var pics   = config.pictures;

			for (var i = 0, len = pics.length; i < len; ++i) {
				var pic = pics[i];

				if (pic.uploadId === uploadId) {
					pic.abort     = true;
					pic.uploading = false;
					break;
				}
			}
		}

		function uploadPictures (pictures) {
			var config = $scope.uploadPicturesDialogConfig;
			var pics   = config.pictures;

			pictures = pictures || [];

			for (var i = 0, len = pictures.length; i < len; ++i) {
				var picture = pictures[i];
				
				var tmpPic = {
					name: picture.name,
					size: picture.size,
					uploading: true,
					complete: false,
					error: false,
					abort: false,
					progress: 0,
					file: picture
				};

				pictures[i] = tmpPic;
				pics.push(tmpPic);
			}

			if (!config.show && pics.length > 0) {
				openUploadPicturesDialog();
			}

			var path = $scope.path;
			var dir;

			if (path.length >= 2) {
				dir = path[path.length - 1];
			}

			var ids = PictureUploader.uploadPictures(pictures, dir);

			for (var i = 0, len = ids.length; i < len; ++i) {
				var tmpId  = ids[i];
				var tmpPic = pictures[i];

				tmpPic.uploadId = tmpId;
			}
		}

		function abortUploadPicture (picture) {
			console.log("abort upload picture");
			return $q.resolve();
		}

		function openCreateDirDialog () {
			$scope.createDirDialogConfig.show = true;
		}

		function closeCreateDirDialog () {
			$scope.createDirDialogConfig.name = "";
			$scope.createDirDialogConfig.show = false;
		}

		function openUpdateDirDialog (dir) {
			$scope.updateDirDialogConfig.dir  = dir;
			$scope.updateDirDialogConfig.show = true;
		}

		function closeUpdateDirDialog () {
			$scope.updateDirDialogConfig.dir  = null;
			$scope.updateDirDialogConfig.show = false;
		}

		function openDeleteDirDialog (dir) {
			$scope.deleteDirDialogConfig.dir  = dir;
			$scope.deleteDirDialogConfig.show = true;
		}

		function closeDeleteDirDialog () {
			$scope.deleteDirDialogConfig.dir  = null;
			$scope.deleteDirDialogConfig.show = false;
		}

		function openUploadPicturesDialog () {
			$scope.uploadPicturesDialogConfig.show = true;
		}

		function closeUploadPicturesDialog () {
			$scope.uploadPicturesDialogConfig.show = false;
			$scope.uploadPicturesDialogConfig.pictures = [];
		}
	}
]);