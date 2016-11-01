angular.module("Backend").controller("articleCategoryCtrl", [
	"$scope",
	"$q",
	"Category",
	"Validation",

	function (
			$scope,
			$q,
			Category,
			Validation
		) {

		$scope.checkAll = false;

		$scope.categories = [];

		$scope.acd = {
			name: "",
			show: false,
			config: {
				title: "Add Category",
				
				buttons: [
					{
						text: "Cancel",
						style: {
							color: "#fff",
							backgroundColor: "#666"
						},
						onClick: function () {
							showAddCategoryDialog(false);
						}
					},

					{
						text: "Confirm",
						style: {
							color: "#fff",
							backgroundColor: "#2196F3"
						},
						onClick: function () {
							var name = $scope.acd.name.trim();

							if (!Validation.checkCategory(name)) {
								console.warn("category name invalid");
								return;
							}

							if (isCategoryExist(name)) {
								console.warn("category already exist");
								return;
							}

							addCategory(name).then(function () {
								showAddCategoryDialog(false);
							})
							.catch(function (err) {
								console.error(err);
								var msg = err.message;
							});
						}
					}
				],

				onClose: function () {
					showAddCategoryDialog(false);
				}
			}
		};

		$scope.ucd = {
			category: null,
			show: false,
			config: {
				title: "Update Category",
				
				buttons: [
					{
						text: "Cancel",
						style: {
							color: "#fff",
							backgroundColor: "#666"
						},
						onClick: function () {
							showUpdateCategoryDialog(false);
						}
					},

					{
						text: "Confirm",
						style: {
							color: "#fff",
							backgroundColor: "#2196F3"
						},
						onClick: function () {
							var category  = $scope.ucd.category;
							category.name = category.name.trim();

							if (!Validation.checkCategory(category.name)) {
								console.warn("category name invalid");
								return;
							}

							if (isCategoryConfictWithOthers(category)) {
								console.warn("category already exist");
								return;
							}

							if (isCategoryUnChanged(category)) {
								console.warn("category unchanged");
								return;
							}

							updateCategory(category).then(function () {
								showUpdateCategoryDialog(false);
							})
							.catch(function (err) {
								console.error(err);
								var msg = err.message;
							});
						}
					}
				],

				onClose: function () {
					showUpdateCategoryDialog(false);
				}
			}
		};

		$scope.dcd = {
			category: null,
			show: false,
			config: {
				title: "Delete Category",
				
				buttons: [
					{
						text: "Cancel",
						style: {
							color: "#fff",
							backgroundColor: "#666"
						},
						onClick: function () {
							showDeleteCategoryDialog(false);
						}
					},

					{
						text: "Confirm",
						style: {
							color: "#fff",
							backgroundColor: "#2196F3"
						},
						onClick: function () {
							deleteCategory($scope.dcd.category).then(function () {
								showDeleteCategoryDialog(false);
							})
							.catch(function (err) {
								console.error(err);
								var msg = err.message;
							});
						}
					}
				],

				onClose: function () {
					showDeleteCategoryDialog(false);
				}
			}
		};

		$scope.dcsd = {
			show: false,
			categories: [],
			config: {
				title: "Delete Category",
				
				buttons: [
					{
						text: "Cancel",
						style: {
							color: "#fff",
							backgroundColor: "#666"
						},
						onClick: function () {
							showDeleteCategoriesDialog(false);
						}
					},

					{
						text: "Confirm",
						style: {
							color: "#fff",
							backgroundColor: "#2196F3"
						},
						onClick: function () {
							console.log($scope.dcsd.categories);
							debugger;
							deleteCategories($scope.dcsd.categories).then(function () {
								showDeleteCategoriesDialog(false);
							})
							.catch(function (err) {
								console.error(err);
								var msg = err.message;
							});
						}
					}
				],

				onClose: function () {
					showDeleteCategoriesDialog(false);
				}
			}
		};

		$scope.checkAllChanged = function () {
			checkAllCategories($scope.checkAll);
		};

		$scope.categoryCheckStateChanged = function () {
			$scope.checkAll = isAllCategoriesChecked();
		};

		$scope.addCategory = function () {
			showAddCategoryDialog(true);
		};

		$scope.updateCategory = function (category) {
			showUpdateCategoryDialog(true);
			$scope.ucd.category = angular.copy(category);
		};

		$scope.deleteCategory = function (category) {
			showDeleteCategoryDialog(true);
			$scope.dcd.category = category;
		};

		$scope.deleteCheckedCategories = function () {
			showDeleteCategoriesDialog(true);
			$scope.dcsd.categories = getAllCheckedCategoried();
		};

		init();

		function init () {
			let promises = [];
			let p = null;

			p = initCategory();
			promises.push(p);

			return $q.all(p);
		}

		function initCategory () {
			return new $q(function (resolve, reject) {
				Category.getCategories().then(function (categories) {
					categories = categories || [];
					
					for (var i = 0, ii = categories.length; i < ii; ++i) {
						categories[i].isChecked = false;
					}

					$scope.categories = categories;

					resolve();
				})
				.catch(reject);
			});
		}

		function checkAllCategories (checked) {
			checked = !!checked;

			var categories = $scope.categories;

			for (var i = 0, ii = categories.length; i < ii; ++i) {
				categories[i].isChecked = checked;
			}
		}

		function isAllCategoriesChecked () {
			var categories = $scope.categories;

			for (var i = 0, ii = categories.length; i < ii; ++i) {
				if (!categories[i].isChecked) {
					return false;
				}
			}

			return true;
		}

		function getAllCheckedCategoried () {
			var tCategories = [];

			var categories = $scope.categories;

			for (var i = 0, ii = categories.length; i < ii; ++i) {
				var category = categories[i];
				if (category.isChecked) {
					tCategories.push(category);
				}
			}

			return tCategories;
		}

		function addCategory (name) {
			return new $q(function (resolve, reject) {
				if (!Validation.checkCategory(name)) {
					reject(new Error("category name invalid"));
					return;
				}

				Category.addCategory(name).then(function (category) {
					category.isChecked = false;
					$scope.categories.push(category);

					resolve();
				})
				.catch(reject);
			});
		}

		function updateCategory (category) {
			return new $q(function (resolve, reject) {
				if (!Validation.checkCategory(category.name)) {
					reject(new Error("category name invalid"));
					return;
				}

				Category.updateCategory(category).then(function () {
					var categories = $scope.categories;
					
					for (var i = 0, ii = categories.length; i < ii; ++i) {
						if (categories[i].id === category.id) {
							categories[i] = category;
							break;
						}
					}

					resolve();
				})
				.catch(reject)
			});	
		}

		function deleteCategory (category) {
			return new $q(function (resolve, reject) {
				Category.deleteCategory(category).then(function () {
					var categories = $scope.categories;
					
					for (var i = 0, ii = categories.length; i < ii; ++i) {
						if (categories[i].id === category.id) {
							categories.splice(i, 1);
							break;
						}
					}

					resolve();	
				})
				.catch(reject);
			});
		}

		function deleteCategories (categories) {
			return new $q(function (resolve, reject) {
				Category.deleteCategories(categories).then(function () {
					var oCategories = $scope.categories;

					for (var i = 0, ii = categories.length; i < ii; ++i) {
						var category  = categories[i];

						for (var j = 0, jj = oCategories.length; j < jj; ++j) {
							var oCategory = oCategories[j];

							if (category.id === oCategory.id) {
								oCategories.splice(j, 1);
								break;
							}
						}
					}

					resolve();
				})
				.catch(reject);
			});
		}

		function isCategoryExist (name) {
			var categories = $scope.categories;
			
			for (var i = 0, ii = categories.length; i < ii; ++i) {
				var category = categories[i];
				if (category.name === name) {
					return true;
				}
			}

			return false;
		}

		function isCategoryUnChanged (category) {
			var categories = $scope.categories;
			
			for (var i = 0, ii = categories.length; i < ii; ++i) {
				if (category.id === categories[i].id
					&& category.name === categories[i].name) {
					return true;
				}
			}

			return false;
		}

		function isCategoryConfictWithOthers (category) {
			var categories = $scope.categories;
			
			for (var i = 0, ii = categories.length; i < ii; ++i) {
				if (category.id !== categories[i].id
					&& category.name === categories[i].name) {
					return true;
				}
			}

			return false;
		}

		function showAddCategoryDialog (show) {
			$scope.acd.name = "";
			$scope.acd.show = !!show;	
		}

		function showUpdateCategoryDialog (show) {
			show = !!show;

			$scope.ucd.show = show;

			if (!show) {
				$scope.ucd.category = null;
			}
		}

		function showDeleteCategoryDialog (show) {
			show = !!show;

			$scope.dcd.show = show;

			if (!show) {
				$scope.dcd.category = null;
			}
		}

		function showDeleteCategoriesDialog (show) {
			show = !!show;

			$scope.dcsd.show = show;

			if (!show) {
				$scope.dcsd.categories = [];
			}
		}
	}
]);