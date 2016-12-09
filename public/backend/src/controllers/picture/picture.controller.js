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
			
			var curtPage = $scope.pagination.curtPage;
			changeToPage(curtPage).then(function () {
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

								changeToPage(1);
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
						
						deleteDir(dir).then(function () {
							closeDeleteDirDialog();

							changeToPage(1);	
						}).catch(function (err) {
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

			hasComplete: false,

			pictures: [],

			finishedPictures: []
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

							changeToPage(1);
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

		$scope.copyPictureLinkDialogConfig = {
			show: false,

			link: "",

			title: "Copy Link",

			buttons: [
				{
					text: "Cancel",
					style: {
						color: "#fff",
						backgroundColor: "#666"
					},
					onClick: function () {
						closeCopyPictureLinkDialog();
					}
				}
			],

			onClose: function () {
				closeCopyPictureLinkDialog();
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
			var path = $scope.path;

			if (dir === path[path.length - 1].dir) {
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
			var item = path[path.length - 2];
			var dir  = item.dir;

			startLoading();

			changeToDir(dir).then(function () {
				stopLoading();
			}).catch(function (err) {
				console.error(err);
				stopLoading();
			});
		};

		$scope.openDeletePictureDialog = function (pic) {
			openDeletePictureDialog(pic);
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

		$scope.copyPictureLink = function (pic) {
			var link =  $location.protocol() + "://";
				link += $location.host();
				link += ":" + $location.port();;
				link += pic.url;

			if (Clipboard.isSupportCopy()) {
				Clipboard.copyText(link);
			} else {
				openCopyPictureLinkDialog(link);
			}
		};

		$scope.activeDir = function (dir) {
			activeItem(dir);
		};

		$scope.activePic = function (pic) {
			activeItem(pic);
		};

		$scope.batchDelete = function () {
			if (!$scope.hasChecked) {
				return;
			}

			batchDelete().then(function () {
				changeToPage(1);
			}).catch(function (err) {
				console.error(err);
			});
		};

		init();	

		function init () {
			startLoading();

			initPath()
				.then(initPreviewMode)
				.then(function () {
					var dir = getCurtDir();

					return $q.all([
						loadDirsNumber(dir),
						loadPicsNumber(dir)
					]);
				})
				.then(initPagination)
				.then(function () {
					var numOfDirs  = $scope.dir.number;
					var numOfPics  = $scope.pic.number;
					var pagination = $scope.pagination;

					var dir = getCurtDir();
					var curtPage = pagination.curtPage;
					var numPerPage = pagination.numPerPage;
					
					return $q.all([
						loadDirs(dir, curtPage, numOfDirs, numPerPage),
						loadPics(dir, curtPage, numOfDirs, numOfPics, numPerPage)
					]);
				})
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

				$q.all([
					loadDirsNumber(),
					loadPicsNumber()
				])
				.then(function (args) {
					var numOfDirs = args[0];
					var numOfPics = args[1];

					var ids      = parseUrlDirIds();
					var curtPage = parseUrlPage();

					// init root dir pagination
					var path = [{
						dir: DEFAULT_PATH_DIR,
						pagination: {
							total: numOfDirs + numOfPics,
							curtPage: ids.length > 0 ? 1: curtPage,
							numPerPage: NUMBER_PRE_PAGE
						}
					}];

					if (ids.length <= 0) {
						$scope.path = path;
						resolve();
						return;
					}

					$q.all([
						Directory.getDirectoriesByIds(ids),
						Directory.getNumbersOfDirectories(ids),
						Picture.getNumbersOfPictures(ids)
					])
					.then(function (args) {
						var dirs       = args[0];
						var numsOfDirs = args[1];
						var numsOfPics = args[2];

						if (dirs.length <= 0 
							|| dirs[0] == null 
							|| dirs[0].parentDirectory != null) {
							reject(new Error("url path dir not exist"));
							return;
						}

						path.push({
							dir: dirs[0],
							pagination: {
								total: numsOfDirs[0] + numsOfPics[0],
								curtPage: dirs.length === 1 ? curtPage : 1,
								numPerPage: NUMBER_PRE_PAGE
							}
						});

						for (var i = 1, len = dirs.length; i < len; ++i) {
							var curtDir = dirs[i];
							var prevDir = dirs[i - 1];

							if (curtDir == null 
								|| curtDir.parentDirectory != prevDir.id) {
								reject(new Error("url path dir not exist"));
								return;
							}

							path.push({
								dir: dirs[i],
								pagination: {
									total: numsOfDirs[i] + numsOfPics[i],
									curtPage: i === len - 1 ? curtPage : 1,
									numPerPage: NUMBER_PRE_PAGE 
								}
							});
						}

						$scope.path = path;
						resolve();
					})
					.catch(reject);

				})
				.catch(reject);
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
			var path = $scope.path;
			var item = path[path.length - 1];
			var pagination = $scope.pagination = item.pagination;
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
				var dir = pathItem.dir;
				
				if (i > 1) {
					pathStr += " ";
				}
				
				pathStr += dir.id;
			}

			$location.search("path", pathStr);
		}

		function updateUrlPreviewMode (preview) {
			$location.search("preview", !!preview ? "1" : "0");
		}

		function updateUrlPage (page) {
			$location.search("page", page);
		}

		function loadDirs (pDir, curtPage, numberOfDir, numPerPage) {
			return new $q(function (resolve, reject) {
				curtPage -= 1;
				
				var start  = curtPage * numPerPage;
				if (start >= numberOfDir) {
					var dirs = $scope.dir.dirs = [];
					resolve(dirs);
					return;
				}

				var number = numPerPage;
				if (numberOfDir < start + numPerPage) {
					number = numberOfDir - start;
				}

				var pDirId = pDir == null ? null : pDir.id;
				Directory.getDirectories(pDirId, start, number).then(function (dirs) {
					angular.forEach(dirs, function (dir, index) {
						dir.index = start + index;
						dir.isChecked = false;
						dir.isActive  = false;
					});
					$scope.dir.dirs = dirs;

					resolve(dirs);
				}).catch(reject);
			});
		}

		function loadDirsNumber (pDir) {
			return new $q(function (resolve, reject) {
				var pDirId = pDir == null ? null : pDir.id;
				
				Directory.getNumberOfDirectories(pDirId).then(function (number) {
					$scope.dir.number = number;
					resolve(number);
				}).catch(reject);
			});
		}

		function getCurtDir () {
			var path = $scope.path;
				
			var dir;
			if (path.length > 1) {
				var pathItem = path[path.length - 1];
				dir = pathItem.dir;
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

				var pDir = getCurtDir();

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
							$scope.pagination.total -= 1;
							$scope.dir.number -= 1;
							break;
						}
					}

					resolve();
				})
				.catch(reject);
			});
		}

		function deleteDirs (dirs) {
			return new $q(function (resolve, reject) {
				Directory.deleteDirectories(dirs).then(function () {
					var directories = $scope.dir.dirs;

					for (var i = 0, ii = dirs.length; i < ii; ++i) {
						for (var j = 0, jj = directories.length; j < jj; ++j) {
							if (dirs[i].id === directories[j].id) {
								directories.splice(j, 1);
								$scope.pagination.total -= 1;
								$scope.dir.number -= 1;
								break;
							}
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
			return new $q(function (resolve, reject) {
				$q.all([
					loadDirsNumber(dir),
					loadPicsNumber(dir)
				])
				.then(function (args) {
					var numOfDirs  = args[0];
					var numOfPics  = args[1];
					var curtPage   = 1;
					var numPerPage = NUMBER_PRE_PAGE;

					var pagination = $scope.pagination = {
						total: numOfDirs + numOfPics,
						curtPage: curtPage,
						numPerPage: numPerPage
					};

					var path = $scope.path;
					
					path.push({
						dir: dir,
						pagination: pagination
					});

					updateUrlPage(curtPage);
					updateUrlPath(path);

					return $q.all([
						loadDirs(dir, curtPage, numOfDirs, numPerPage),
						loadPics(dir, curtPage, numOfDirs, numOfPics, numPerPage)
					]);
				})
				.then(function () {
					$scope.hasChecked   = false;
					$scope.isAllChecked = false;

					resolve();
				})
				.catch(reject);
			});
		}

		function changeToDir (dir) {
			return new $q(function (resolve, reject) {
				var path  = $scope.path;

				for (var i = path.length - 1; i > 0; --i) {
					var item = path[i];
					
					if (item.dir === dir) {
						break;
					}

					path.pop();
				}

				if (path.length <= 0) {
					reject(new Error("change to dir: " + dir.id + " not found in path"));
					return;
				}

				var item = path[path.length - 1];
				var pagination = item.pagination;
				var curtPage = pagination.curtPage;
				var numPerPage = pagination.numPerPage;

				$q.all([
					loadDirsNumber(dir),
					loadPicsNumber(dir)
				])
				.then(function (args) {
					var numOfDirs = args[0];
					var numOfPics = args[1];

					return $q.all([
						loadDirs(dir, curtPage, numOfDirs, numPerPage),
						loadPics(dir, curtPage, numOfDirs, numOfPics, numPerPage)
					]);
				})
				.then(function () {
					$scope.hasChecked   = false;
					$scope.isAllChecked = false;
					$scope.pagination   = pagination;

					updateUrlPage(curtPage);
					updateUrlPath(path);

					resolve();
				})
				.catch(reject);
			});
		}

		function initPics () {
			return loadPics();
		}

		function loadPics (pDir, curtPage, numberOfDirs, numberOfPics, numPerPage) {
			return new $q(function (resolve, reject) {
				curtPage -= 1;

				if ((curtPage + 1) * numPerPage <= numberOfDirs) {
					var pics = $scope.pic.pics = [];
					resolve(pics);
					return;
				}

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
					var pics = $scope.pic.pics = [];
					resolve(pics);
					return;
				}

				var pDirId = pDir == null ? null : pDir.id;

				Picture.getPictures(pDirId, start, number).then(function (pics) {
					angular.forEach(pics, function (pic, index) {
						pic.index = numberOfDirs + start + index;
						pic.isChecked = false;
						pic.isActive  = false;
					});

					pics = $scope.pic.pics = pics || [];

					resolve(pics);
				})
				.catch(reject);
			});
		}

		function loadPicsNumber (pDir) {
			return new $q(function (resolve, reject) {
				var pDirId = pDir == null ? null : pDir.id;

				Picture.getNumberOfPictures(pDirId).then(function (number) {
					$scope.pic.number = number;

					resolve(number);
				})
				.catch(reject);
			});
		}
		
		function changeToPage (page) {
			return new $q(function (resolve, reject) {
				var numOfDirs  = $scope.dir.number;
				var numOfPics  = $scope.pic.number;
				var pagination = $scope.pagination;
				var curtPage   = pagination.curtPage = page;
				var numPerPage = pagination.numPerPage;
				var curtDir    = getCurtDir();

				return $q.all([
					loadDirs(curtDir, curtPage, numOfDirs, numPerPage),
					loadPics(curtDir, curtPage, numOfDirs, numOfPics, numPerPage)
				])
				.then(function () {
					$scope.hasChecked   = false;
					$scope.isAllChecked = false;

					updateUrlPage(curtPage);

					resolve();
				})
				.catch(reject);
			});
		}

		function parseUrlDirIds () {
			var pathStr = $location.search()['path'];

			if (!angular.isString(pathStr)) {
				return [];
			}

			var ids = pathStr.split(" ");;

			for (var i = 0, len = ids.length; i < len; ++i) {
				var idStr = ids[i].trim();
						
				if (idStr == "") {
					--i;
					--len;
					ids.splice(i, 1);
					continue;
				}

				var idInt = parseInt(idStr);

				if (!(angular.isNumber(idInt) && idInt === idInt) || idInt != idStr) {
					throw new Error("url path invalid");
				}

				ids[i] = idInt;
			}

			return ids;
		}

		function parseUrlPage () {
			var page = parseInt($location.search()['page']);
			
			if (!(angular.isNumber(page) && page === page) || page < 1) {
				page = 1;
			}

			return page;
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

					config.hasComplete = true;

					$scope.pagination.total += 1;
					$scope.pic.number += 1;
					$scope.pic.pics.shift(picture);
					break;
				}
			}

			if (checkUploadPictureEnd() && config.hasComplete) {
				config.hasComplete = false;
				changeToPage(1);
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

			if (checkUploadPictureEnd() && config.hasComplete) {
				config.hasComplete = false;
				changeToPage(1);
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

			if (checkUploadPictureEnd() && config.hasComplete) {
				config.hasComplete = false;
				changeToPage(1);
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
				var item = path[path.length - 1];
				dir = item.dir;
			}

			var ids = PictureUploader.uploadPictures(pictures, dir);

			for (var i = 0, len = ids.length; i < len; ++i) {
				var tmpId  = ids[i];
				var tmpPic = pictures[i];

				tmpPic.uploadId = tmpId;
			}
		}

		function checkUploadPictureEnd () {
			var config = $scope.uploadPicturesDialogConfig;
			var pics   = config.pictures;

			for (var i = 0, len = pics.length; i < len; ++i) {
				var tmpPic = pics[i];

				if (tmpPic.uploading) {
					return false;
				}
			}

			return true;
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

							$scope.pagination.total -= 1;
							$scope.pic.number -= 1;
							break;
						}
					}

					resolve();
				})
				.catch(reject);
			});
		}

		function deletePictures (pics) {
			return new $q(function (resolve, reject) {
				Picture.deletePictures(pics).then(function () {
					var pictures = $scope.pic.pics;

					for (var i = 0, ii = pics.length; i < ii; ++i) {
						for (var j = 0, jj = pictures.length; j < jj; ++jj) {
							if (pics[i].id === pictures[j].id) {
								pictures.splice(j, 1);

								$scope.pagination.total -= 1;
								$scope.pic.number -= 1;
								break;
							}
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

		function getCheckedPics () {
			var tPics = [];

			var pics = $scope.pic.pics;
			for (var i = 0, len = pics.length; i < len; ++i) {
				var pic = pics[i];

				if (pic.isChecked) {
					tPics.push(pic);
				}
			}

			return tPics;
		}

		function getCheckedDirs () {
			var tDirs = [];

			var dirs = $scope.dir.dirs;
			for (var i = 0, len = dirs.length; i < len; ++i) {
				var dir = dirs[i];

				if (dir.isChecked) {
					tDirs.push(dir);
				}
			}

			return tDirs;
		}

		function activeItem (item) {
			var dirs = $scope.dir.dirs;
			angular.forEach(dirs, function (dir) {
				dir.isActive = false;
			})
			
			var pics = $scope.pic.pics;
			angular.forEach(pics, function (pic) {
				pic.isActive = false;
			});

			item.isActive = true;
		}

		function batchDelete () {
			var promises = [];
			var p = null;

			var pics = getCheckedPics();
			p = deletePictures(pics);
			promises.push(p);

			var dirs = getCheckedDirs();
			p = deleteDirs(dirs);
			promises.push(p);

			return $q.all(promises);
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

		function openCopyPictureLinkDialog (link) {
			$scope.copyPictureLinkDialogConfig.show = true;
			$scope.copyPictureLinkDialogConfig.link = link;
		}

		function closeCopyPictureLinkDialog () {
			$scope.copyPictureLinkDialogConfig.show = false;
			$scope.copyPictureLinkDialogConfig.link = "";
		}
	}
]);