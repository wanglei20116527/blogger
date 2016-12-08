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
				
		var DEFAULT_PATH_DIR = {
			name: 'All'
		};
		
		var NUMBER_PRE_PAGE = 10;

		// $scope.contextMenu = {
		// 	dir: {
		// 		dir: null,
				
		// 		_show: false,

		// 		position: {
		// 			top : 0, 
		// 			left: 0
		// 		},

		// 		show: function (event, dir) {
		// 			event.preventDefault();

		// 			showDirContextMenu(dir, {
		// 				top: 0,
		// 				left: 0
		// 			});

		// 			hidePictureContextMenu();
		// 		},
				
		// 		hide: function () {
		// 			hideDirContextMenu();
		// 		},

		// 		update: function () {
		// 			openUpdateDirDialog(this.dir);
		// 			hideDirContextMenu();
		// 		},

		// 		delete: function () {
		// 			openDeleteDirDialog(this.dir);
		// 			hideDirContextMenu();
		// 		}
		// 	},

		// 	pic: {
		// 		_show: false,

		// 		pic: null,

		// 		position: {
		// 			top: 0,
		// 			left: 0	
		// 		},

		// 		isSupportCopyLink: Clipboard.isSupportCopy(),

		// 		show: function (event, pic) {;
		// 			event.preventDefault();

		// 			pic = angular.copy(pic);

		// 			showPictureContextMenu(pic, {
		// 				top: 0,
		// 				left: 0
		// 			});

		// 			hideDirContextMenu();
		// 		},

		// 		hide: function () {
		// 			hidePictureContextMenu();
		// 		},

		// 		delete: function () {
		// 			var pic = $scope.contextMenu.pic.pic;

		// 			openDeletePictureDialog(pic);
					
		// 			hidePictureContextMenu();
		// 		},

		// 		copyLink: function () {
		// 			var pic = $scope.contextMenu.pic.pic;
					
		// 			copyPictureLinkToClipboard(pic);

		// 			hidePictureContextMenu();
		// 		}
		// 	}
		// };

		$scope.isLoading = true;

		$scope.path = [];

		$scope.dir = {
			number: 0,
			dirs: [],
		};

		$scope.pic = {
			number: 0,
			pics: [],
		};

		$scope.preview = {
			show: false
		};

		$scope.pagination = {
			total: 0,
			curtPage: 1,
			numPerPage: NUMBER_PRE_PAGE,
		};

		$scope.hasChecked   = false;
		$scope.isAllChecked = false;

		$scope.togglePreview = function () {
			var preview = $scope.preview.show = !$scope.preview.show;

			updateUrlPreviewMode(preview);
		};

		$scope.toggleAllChecked = function () {
			toggleAllChecked();
		};

		$scope.toggleCategoryChecked = function (category) {
			toggleChecked(category);
		};

		$scope.togglePictureChecked = function (pic) {
			toggleChecked(pic);
		};

		$scope.onPageChanged = function () {
			startLoading();

			$q.all([loadDirs(), loadPics()]).then(function () {
				$scope.hasChecked   = false;
				$scope.isAllChecked = false;

				stopLoading();

			}).catch(function (err) {
				console.error(err);
				stopLoading();
			});
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

						createDir(name.trim())
							.then(function () {
								closeCreateDirDialog();

								startLoading();
							})
							.then(loadDirsNumber)
							.then(loadPicsNumber)
							.then(initPagination)
							.then(loadDirs)
							.then(loadPics)
							.then(function () {
								stopLoading();
								$scope.hasChecked   = false;
								$scope.isAllChecked = false;
							})
							.catch(function (err) {
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
						
						deleteDir(dir)
							.then(function () {
								closeDeleteDirDialog();

								startLoading();
							})
							.then(loadDirsNumber)
							.then(loadPicsNumber)
							.then(initPagination)
							.then(loadDirs)
							.then(loadPics)
							.then(function () {
								stopLoading();
								$scope.hasChecked   = false;
								$scope.isAllChecked = false;
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
							$scope.hasChecked   = hasChecked();
							$scope.isAllChecked = isAllChecked();

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
			startLoading();

			enterToDir(dir).then(function () {
				console.log("enter to dir success: ");

				stopLoading();
			}).catch(function (err) {
				console.error(err);
				stopLoading();
			});
		};

		$scope.changeToDir = function (dir) {
			var path = $scope.path, 
				len  = path.length;

			if (dir === path[len - 1]) {
				return;
			}

			startLoading();

			changeToDir(dir).then(function () {
				stopLoading();
			}).catch(function (err) {
				console.error(err);
				stopLoading();
			});
		};

		$scope.backToParentDir = function () {
			var path = $scope.path;
			
			if (path.length < 2) {
				console.error("curt path length less then 2");
				return;
			}
			
			var dir = path[path.length - 2];
			
			startLoading();

			changeToDir(dir).then(function () {
				stopLoading();
			}).catch(function (err) {
				console.error(err);
				stopLoading();
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

			$scope.$apply(function () {
				uploadPictures(pictures);
			});

			event.target.value = null;
		};

		$scope.batchDelete = function () {	
		};

		init();	

		function init () {
			startLoading();

			initPath()
				.then(initPreviewMode)
				.then(initDirsNumber)
				.then(initPicsNumber)
				.then(initPagination)
				.then(initDirs)
				.then(initPics)
				.then(function () {
					initPictureUploadEvents();
					stopLoading();
				})
				.catch(function (err) {
					console.error(err);
				});

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

		function initPreviewMode () {
			var preview = $location.search()['preview'];
			$scope.preview.show = preview === "1";
		}

		function initDirsNumber () {
			return loadDirsNumber();
		}

		function initPicsNumber () {
			return loadPicsNumber();
		}

		function initPagination () {
			var pic = $scope.pic;
			var dir = $scope.dir;

			$scope.pagination = {
				total      : pic.number + dir.number,
				curtPage   : 1,
				numPerPage : NUMBER_PRE_PAGE
			};
		}

		function initDirs() {
			return loadDirs();
		}

		function updateUrlPath (path) {
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

		function updateUrlPreviewMode (preview) {
			$location.search("preview", !!preview ? "1" : "0");
		}

		function loadDirs () {
			return new $q(function (resolve, reject) {
				var pDir = getCurtDir();

				var dir = $scope.dir;
				var numberOfDir = dir.number; 

				var pagination = $scope.pagination;
				var curtPage   = pagination.curtPage - 1;
				var numPerPage = pagination.numPerPage;
				
				var start  = curtPage * numPerPage;
				if (start >= numberOfDir) {
					$scope.dir.dirs = [];
					resolve();
					return;
				}

				var number = numPerPage;
				if (numberOfDir < start + numPerPage) {
					number = numberOfDir - start;
				}

				Directory.getDirectories(pDir, start, number).then(function (dirs) {
					angular.forEach(dirs, function (dir, index) {
						dir.index = start + index;
						dir.isChecked = false;
						dir.isActive  = false;
					});
					$scope.dir.dirs = dirs;

					resolve();
				}).catch(reject);
			});
		}

		function loadDirsNumber () {
			return new $q(function (resolve, reject) {
				var pDir = getCurtDir();

				Directory.getNumberOfDirectories(pDir).then(function (number) {
					$scope.dir.number = number;
					resolve();
				}).catch(reject);
			});
		}

		function getCurtDir () {
			var path = $scope.path;
				
			var dir;
			if (path.length > 1) {
				dir = path[path.length - 1];
			}

			return dir;
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
					$scope.pagination.total += 1;

					$scope.dir.number += 1;
					$scope.dir.dirs.unshift(dir);

					$scope.isAllChecked = false;

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
							dir.isChecked = dirs[i].isChecked;
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
			var path = $scope.path;

			if (path.length <= 0) {
				path.push(DEFAULT_PATH_DIR);
			}

			path.push(dir);

			$scope.path = path;

			updateUrlPath(path);

			return new $q(function (resolve, reject) {
				initDirsNumber()
					.then(initPicsNumber)
					.then(initPagination)
					.then(initDirs)
					.then(initPics)
					.then(function () {
						$scope.hasChecked   = false;
						$scope.isAllChecked = false;
						resolve();
					})
					.catch(reject);
			});
		}

		function changeToDir (dir) {
			var path  = $scope.path;
			var tPath = [];

			if (dir !== DEFAULT_PATH_DIR) {
				var find = false;
				
				for (var i = 0, len = path.length; i < len; ++i) {
					var dirItem = path[i];
					tPath.push(dirItem);

					if (dirItem.id === dir.id) {
						find = true;
						break;
					}
				}

				if (!find) {
					tPath = [];
					dir = undefined;
				}
			} else {
				dir = undefined;
			}
			
			$scope.path = tPath;

			updateUrlPath(tPath);

			return new $q(function (resolve, reject) {
				initDirsNumber()
					.then(initPicsNumber)
					.then(initPagination)
					.then(initDirs)
					.then(initPics)
					.then(function () {
						$scope.hasChecked   = false;
						$scope.isAllChecked = false;
						resolve();
					})
					.catch(reject);
			});
		}

		function initPics () {
			return loadPics();
		}

		function loadPics () {
			return new $q(function (resolve, reject) {
				var pDir = getCurtDir();
				var numberOfDirs = $scope.dir.number;

				var pagination = $scope.pagination;
				var curtPage   = pagination.curtPage - 1;
				var numPerPage = pagination.numPerPage;

				if ((curtPage + 1) * numPerPage <= numberOfDirs) {
					$scope.pic.pics = [];
					resolve();
					return;
				}

				var numberOfPics = $scope.pic.number;

				var tmpCurtPage = curtPage - Math.floor(numberOfDirs / numPerPage);
				var numberRemainedDirs = numberOfDirs % numPerPage;

				var start = tmpCurtPage * numPerPage;
				if (tmpCurtPage > 0) {
					start -= numberRemainedDirs;
				}

				var number = numPerPage - numberRemainedDirs;
				if (start + number > numberOfPics) {
					number = numberOfPics - start;
				}

				if (number == 0) {
					$scope.pic.pics = [];
					resolve();
					return;
				}

				Picture.getPictures(pDir, start, number).then(function (pics) {
					angular.forEach(pics, function (pic, index) {
						pic.index = numberOfDirs + start + index;
						pic.isChecked = false;
						pic.isActive  = false;
					});

					$scope.pic.pics = pics || [];

					resolve();
				})
				.catch(reject);
			});
		}

		function loadPicsNumber () {
			return new $q(function (resolve, reject) {
				var pDir = getCurtDir();

				Picture.getNumberOfPictures(pDir).then(function (number) {
					$scope.pic.number = number;

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

					startLoading();

					loadDirsNumber()
						.then(loadPicsNumber)
						.then(initPagination)
						.then(loadDirs)
						.then(loadPics)
						.then(function () {
							$scope.hasChecked   = false;
							$scope.isAllChecked = false;
							
							stopLoading();
						}) 
						.catch(function (err) {
							console.error(err);
							stopLoading();
						});
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
					var pictures = $scope.pic.pics;

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
			console.log(Clipboard.copyText(pic.url));
		}

		function toggleAllChecked () {
			var isChecked = $scope.isAllChecked = !$scope.isAllChecked;

			var dirs = $scope.dir.dirs;
			angular.forEach(dirs, function (dir) {
				dir.isChecked = isChecked;
			});

			var pics = $scope.pic.pics;
			angular.forEach(pics, function (pic) {
				pic.isChecked = isChecked;
			});

			$scope.hasChecked = isChecked;
		}

		function isAllChecked () {
			var dirs = $scope.dir.dirs;
			for (var i = 0, len = dirs.length; i < len; ++i) {
				var dir = dirs[i];

				if (!dir.isChecked) {
					return false;
				}
			}

			var pics = $scope.pic.pics;
			for (var i = 0, len = pics.length; i < len; ++i) {
				var pic = pics[i];

				if (!pic.isChecked) {
					return false;
				}
			}

			return true;
		}

		function hasChecked () {
			var dirs = $scope.dir.dirs;
			for (var i = 0, len = dirs.length; i < len; ++i) {
				var dir = dirs[i];

				if (dir.isChecked) {
					return true;
				}
			}

			var pics = $scope.pic.pics;
			for (var i = 0, len = pics.length; i < len; ++i) {
				var pic = pics[i];

				if (pic.isChecked) {
					return true;
				}
			}

			return false;
		}

		function startLoading () {
			$scope.isLoading = true;
		}

		function stopLoading () {
			$scope.isLoading = false;
		}

		function toggleChecked (item) {
			item.isChecked = !item.isChecked;

			$scope.hasChecked   = hasChecked();
			$scope.isAllChecked = isAllChecked();
		}

		function openCreateDirDialog () {
			$scope.createDirDialogConfig.show = true;
		}

		function closeCreateDirDialog () {
			$scope.createDirDialogConfig.name = "";
			$scope.createDirDialogConfig.show = false;
		}

		function openUpdateDirDialog (dir) {
			$scope.updateDirDialogConfig.dir  = angular.copy(dir);
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