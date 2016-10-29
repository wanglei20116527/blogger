angular.module("Backend").directive("imageUploadDialog", [
	"$q",
	"Picture",
	function ($q, Picture) {
		return {
			restrict: 'E',
			scope: {
				onClose      : "&?",
				onCancel     : "&?",
				onConfirm    : "&?",
			},

			templateUrl: "/backend/static/src/directives/dialog/imageUploadDialog/imageUploadDialog.html",

			link: function (scope, elements, attrs) {
				scope.images = [];

				scope.close = function () {
					// Picture.finishUploadPictureSegment("1a9f168082c35c713dada2357f60feb0cfaa145d139470737c7fae38ffda2e853")
					// .then(function (pic) {
					// 	console.log("((((((((((((((((((((");
					// 	console.log(pic);
					// })
					// .catch(function (err) {
					// 	console.error(err);
					// });

					Picture.abortUploadPictureSegment("1a9f168082c35c713dada2357f60feb0cfaa145d139470737c7fae38ffda2e853").then(function (){
						console.log("abort success");
					}).catch(function (err) {
						console.error(err);
					});
				};

				scope.cancel = function () {	
					Picture.startUploadPictureSegment({
						name: "IMG_20160904_162832.jpg"
					}, {
						id: 15
					}).then(function (id) {
						console.log("id: " + id);
					}).catch(function (err) {
						console.error(err);
					});
				};

				var start = 0;
				var oneM = 1024 * 1024;

				scope.confirm = function () {
					let image = scope.images[0].file;
					let end = start + oneM;
					if (end > image.size) {
						end = image.size;
						console.log("\n\n\n+++++++++++++++++++++++++");
						console.log("the last time");
					}

					let blob  = image.slice(start, end);
					console.log(blob);
					Picture.uploadPictureSegment("1a9f168082c35c713dada2357f60feb0cfaa145d139470737c7fae38ffda2e853",blob)
					.then(function(pic){
						console.log(pic);
					}).catch(function(err){
						console.error(err);
					});

					start = end;
				};

				scope.onFileSelect = function ($event) {
					var el     = $event.target || $event.srcElement;
					var files  = el.files; 
					var images = filterImages(el.files);

					handleImages(images).then(function (images) {
						scope.images = scope.images.concat(images);
						console.log(images);
						console.log("wanglei is cool and houna is cute");
					}).catch(function (err) {
						console.error(err);
					});
				};

				function filterImages (images) {
					var tImages  = [];
					var imageReg = /^image\//; 
					for (var i = 0, len = images.length; i < len; ++i) {
						var image = images[i];
						if (imageReg.test(image.type)) {
							tImages.push(image);
						}
					}
					return tImages;
				}

				function handleImages (images) {
					var tImages  = [];
					var promises = [];

					for (var i = 0, len = images.length; i < len; ++i) {
						var p = (function (image) {
							return new $q(function (resolve, reject) {
								var reader = new FileReader();

								reader.onload = function (ret) {
									resolve({
										file: image,
										url : ret.target.result
									});
								};

								reader.onerror = function (err) {
									reject(err);
								};

								reader.readAsDataURL(image);
							});
						})(images[i]);

						promises.push(p);
					}

					return $q.all(promises);
				}

				function addImages (images) {
					images = scope.images = scope.images.concat(images);
					for (var i = 0, len = images.length; i < len; ++i) {
						images.index = i;
					}
				}

				function deleteImage (image) {
					var tImages = [];
					var images  = scope.images;

					for (var i = 0, len = images.length; i < len; ++i) {
						if (image === images[i]) {
							continue;
						}

						tImages.push(images[i]);
					}

					scope.images = tImages;
				}

				function uploadImages (images) {
					var promises = [];

					for (var i = 0, len = images.length; i < len; ++i) {
						var p = (function (image) {
							return new $q(function (resolve, reject) {
								var file = image.file;
								var xhr = new XMLHttpRequest();
								
								xhr.onreadystatechange = function () {
									if (xhr.readyState === 4) {
										resolve(image);

										console.log(xhr.response);
									}
								};

								xhr.onerror = function (err) {
									reject(err);
								};

								var formData = new FormData();
								// formData.append("picture", file);
								formData.append("directory", JSON.stringify({
									id: 15
								}));

								xhr.open("post", "/backend/picture", true);
								xhr.send(formData);
							});
						})(images[i]);

						promises.push(p);
					}

					$q.all(promises);
				}
				
				function close () {
					scope.onClose && scope.onClose();
				}

				function cancel () {
					scope.onCancel && scope.onCancel();
				}

				function confirm() {
					scope.onConfirm && scope.onConfirm({
						files: []
					});
				}
			}
		};
	}
]);