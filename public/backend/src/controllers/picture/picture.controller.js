angular.module("Backend").controller("pictureCtrl", [
	"$rootScope",
	"$scope",
	"$q",
	"$location",
	"$document",
	"Clipboard",
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
			Clipboard,
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

				position: {
					top : 0, 
					left: 0
				},

				show: function (event, dir) {
					event.preventDefault();

					showDirContextMenu(dir, {
						top: 0,
						left: 0
					});

					hidePictureContextMenu();
				},
				
				hide: function () {
					hideDirContextMenu();
				},

				update: function () {
					openUpdateDirDialog(this.dir);
					hideDirContextMenu();
				},

				delete: function () {
					openDeleteDirDialog(this.dir);
					hideDirContextMenu();
				}
			},

			pic: {
				_show: false,

				pic: null,

				position: {
					top: 0,
					left: 0	
				},

				isSupportCopyLink: Clipboard.isSupportCopy(),

				show: function (event, pic) {;
					event.preventDefault();

					pic = angular.copy(pic);

					showPictureContextMenu(pic, {
						top: 0,
						left: 0
					});

					hideDirContextMenu();
				},

				hide: function () {
					hidePictureContextMenu();
				},

				delete: function () {
					var pic = $scope.contextMenu.pic.pic;

					openDeletePictureDialog(pic);
					
					hidePictureContextMenu();
				},

				copyLink: function () {
					var pic = $scope.contextMenu.pic.pic;
					
					copyPictureLinkToClipboard(pic);

					hidePictureContextMenu();
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

		$scope.deletePictureDialogConfig = {
			show: false,

			pic: null,

			title: "Delete Picture",

			buttons: [
				{
					text: "Cancel",
					style: {
						color: "#fff",
						backgroundColor: "#666"
					},
					onClick: function () {
						closeDeletePictureDialog();
					}
				},

				{
					text: "Confirm",
					style: {
						color: "#fff",
						backgroundColor: "#2196F3"
					},
					onClick: function () {
						var pic = $scope.deletePictureDialogConfig.pic;
						
						deletePicture(pic).then(function () {
							closeDeletePictureDialog();
							console.warn("delete picture success");
						})
						.catch(function (err) {
							console.error(err);
						});
					}
				}
			],

			onClose: function () {
				closeDeletePictureDialog();
			}
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
			enterToDir(dir);
		};

		$scope.changeToDir = function (dir) {
			var path = $scope.path, 
				len  = path.length;

			if (dir === path[len - 1]) {
				return;
			}

			changeToDir(dir);
		};

		$scope.backToParentDir = function () {
			var path = $scope.path;
			
			if (path.length < 2) {
				console.error("curt path length less then 2");
				return;
			}
			
			var pDir = path[path.length - 2];
			
			changeToDir(pDir);
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

			$scope.$apply(function () {
				uploadPictures(pictures);
			});

			event.target.value = null;
		};

		$scope.showPictureContextMenu = function (event, pic) {
			
		};

		$scope.hidePictureContextMenu = function () {

		};

		init();

		function init () {
			initPath().then(function () {
				let path = $scope.path;
				
				let pDir;
				if (path.length > 1) {
					pDir = path[path.length - 1];
				}

				let promises = [];
				let p = null;

				p = initDirs(pDir);
				promises.push(p);

				p = initPictures(pDir);
				promises.push(p);

				return $q.all(promises);
			})
			.then(function () {
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

		function initPath () {
			return new $q(function (resolve, reject) {
				var pathStr = $location.search()['path'];

				if (!angular.isString(pathStr)) {
					resolve();
					return;
				}
				
				var ids = pathStr.split(" ");

				for (var i = 0, len = ids.length; i < len; ++i) {
					var idStr = ids[i].trim();
					
					if (idStr == "") {
						--len;
						--i;
						ids.splice(i, 1);
						continue;
					}

					var idInt = parseInt(idStr);

					if (!angular.isNumber(idInt) || idInt != idStr) {
						reject(new Error("url path invalid"))
						return;
					}

					ids[i] = idInt;
				}

				if (ids.length <= 0) {
					resolve();
					return;
				}

				Directory.getDirectoriesByIds(ids).then(function (dirs) {
					if (dirs.length <= 0 || dirs[0] == null) {
						throw new Error("url path dir not exist");
					}

					for (var i = 1, len = dirs.length; i < len; ++i) {
						var curtDir = dirs[i];
						var prevDir = dirs[i - 1];

						if (curtDir == null 
							|| curtDir.parentDirectory != prevDir.id) {
							throw new Error("url path dir not exist");
						}
					}

					var path = $scope.path;
					path.push(DEFAULT_PATH_DIR);

					$scope.path = path.concat(dirs);

					resolve();
				})
				.catch(function (err) {
					console.error(err);
					reject(err);
				});
			});
		}

		function updataUrlPath (path) {
			if (path.length <= 1) {
				$location.search("path", "");
				return;
			}

			var pathStr = "";
			for (var i = 1, len = path.length; i < len; ++i) {
				var pathItem = path[i];
				
				if (i > 1) {
					pathStr += " ";
				}
				
				pathStr += pathItem.id;
			}

			$location.search("path", pathStr);
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
			var path = angular.copy($scope.path);

			if (path.length <= 0) {
				path.push(DEFAULT_PATH_DIR);
			}

			path.push(dir);

			updataUrlPath(path);
		}

		function changeToDir (dir) {
			var path  = angular.copy($scope.path);
			var tPath = [];

			if (dir !== DEFAULT_PATH_DIR) {
				var find = false;
				
				for (var i = 0, len = path.length; i < len; ++i) {
					var dirItem = path[i];
					tPath.push(dirItem);

					if (dirItem === dir) {
						find = true;
						break;
					}
				}

				if (!find) {
					tPath = [];
				}
			}

			updataUrlPath(tPath);
		}

		function initPictures (pDir) {
			return new $q(function (resolve, reject) {
				Picture.getPictures(pDir).then(function (pictures) {
					$scope.picture.pictures = pictures || [];

					console.log("init pictures success");
					console.log(pictures);

					resolve();
				})
				.catch(reject);
			});
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

		function onCompleteUploadPicture (uploadId, picture) {
			var config = $scope.uploadPicturesDialogConfig;
			var pics   = config.pictures;

			for (var i = 0, len = pics.length; i < len; ++i) {
				var tmpPic = pics[i];

				if (tmpPic.uploadId === uploadId) {
					tmpPic.complete  = true;
					tmpPic.uploading = false;
					break;
				}
			}
			
			// todo add picture to display
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

		function deletePicture (pic) {
			return new $q(function (resolve, reject) {
				Picture.deletePicture(pic).then(function () {
					var pictures = $scope.picture.pictures;

					for (var i = 0, len = pictures.length; i < len; ++i) {
						var picture = pictures[i];
						if (picture.id === pic.id) {
							pictures.splice(i, 1);
							break;
						}
					}

					resolve();
				})
				.catch(reject);
			});
		}

		function copyPictureLinkToClipboard (pic) {
			console.log("wanglei is cool and houna is cute");
			console.log(pic);
			console.log(Clipboard.copyText(pic.url));
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

		function openDeletePictureDialog (pic) {
			pic = angular.copy(pic);

			$scope.deletePictureDialogConfig.show = true;
			$scope.deletePictureDialogConfig.pic  = pic;
		}

		function closeDeletePictureDialog () {
			$scope.deletePictureDialogConfig.show = false;
			$scope.deletePictureDialogConfig.pic  = null;
		}

		function showDirContextMenu (dir, position) {
			var dirContextMenu = $scope.contextMenu.dir;

			dirContextMenu.dir = angular.copy(dir);
			dirContextMenu._show = true;
			dirContextMenu.position = {
				top: position.top || 0,
				left: position.left || 0
			};
		}

		function hideDirContextMenu () {
			var dirContextMenu = $scope.contextMenu.dir;

			dirContextMenu.dir = null;
			dirContextMenu._show = false;
			dirContextMenu.position = {
				top: 0,
				left: 0
			};
		}

		function showPictureContextMenu (picture, position) {
			var picContextMenu = $scope.contextMenu.pic;
			
			picContextMenu.pic = angular.copy(picture);
			picContextMenu._show = true;
			picContextMenu.position = {
				top : position.top  || 0,
				left: position.left || 0
			};
		}

		function hidePictureContextMenu () {
			var picContextMenu = $scope.contextMenu.pic;
			
			picContextMenu.pic = null;
			picContextMenu._show = false;
			picContextMenu.position = {
				top : 0,
				left: 0
			};
		}
	}
]);