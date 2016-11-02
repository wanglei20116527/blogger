angular.module("Backend").controller("pictureCtrl", [
	"$rootScope",
	"$scope",
	"$q",
	"Validation",
	"Directory",
	"Picture",

	function (
			$rootScope, 
			$scope, 
			$q,
			Validation,
			Directory,
			Picture) {

		var path = [];

		$rootScope.$emit("pageChanged", {
			page: "picture",
		});

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

		$scope.isLoading = true;

		$scope.dirs = [];
		$scope.pictures = [];

		$scope.openCreateDirDialog = function () {
			openCreateDirDialog();
		};

		$scope.openUpdateDirDialog = function (dir) {
			openUpdateDirDialog(dir);
		};

		$scope.openDeleteDirDialog = function (dir) {
			openDeleteDirDialog(dir);
		};

		init();

		function init () {
			let promises = [];
			let p = null;

			p = initDirs();
			promises.push(p);

			$q.all(promises).then(function () {

				$scope.isLoading = false;
			})
			.catch(function (err) {
				console.error(err);

				$scope.isLoading = false;
			});
		}

		function initDirs () {
			return new $q(function (resolve, reject) {
				loadDirs().then(function (dirs) {
					$scope.dirs = dirs;

					resolve();
				}).catch(reject);
			});
		}

		function loadDirs (pDir) {
			return Directory.getDirectories(pDir);
		}

		function createDir (name) {
			return new $q(function (resolve, reject) {
				name = (name || "").trim();

				if (!Validation.checkDirectoryName(name)) {
					reject(new Error("dir name " + name + " invalid"));
					return;
				}

				var dirs = $scope.dirs;

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

				var pDir = path.length > 0 ? path[0] : void 0;

				Directory.addDirectory(dir, pDir).then(function (dir) {
					var dirs = $scope.dirs;

					dirs.unshift(dir);

					resolve();
				}).catch(reject);
			});
		}

		function deleteDir (dir) {
			return new $q(function (resolve, reject) {
				Directory.deleteDirectory(dir).then(function () {
					var dirs = $scope.dirs;

					for (var i = 0, len = dirs.length; i < len; ++i) {
						if (dir.id === dirs.id) {
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
					var dirs = $scope.dirs;

					for (var i = 0, len = dirs.length; i < len; ++i) {
						if (dir.id === dirs.id) {
							dirs[i] = dir;
							break;
						}
					}

					resolve();
				})
				.catch(reject);
			});
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
			$scope.deleteDirDialogConfig.show = false;
		}

		function closeDeleteDirDialog () {
			$scope.deleteDirDialogConfig.dir  = null;
			$scope.deleteDirDialogConfig.show = false;
		}

	}
]);