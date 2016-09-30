angular.module("Backend").directive("imageCropper", [
	"$timeout",
	function ($timeout) {
		return {
			restrict: 'E',
			scope: {
				image : "=",
				config: "=?"
			},
			templateUrl: "/backend/static/src/directives/imageCropper/imageCropper.html",
			link: function (scope, element, attrs) {
				var config = angular.merge({}, scope.config || {}, {
					width     : 250,
					height    : 250,
					background: "#000"
				});

				var imageCropper = element[0].querySelector(".image-cropper");
				var imageCropperStyle = {
					position  : "relative",
					width     : config.width  + "px",
					height    : config.height + "px",
					background: config.background
				};
				angular.element(imageCropper).css(imageCropperStyle);



				var wrapper      = element[0].querySelector(".ic-wrapper");
				var sourceCanvas = element[0].querySelector(".ic-source");
				var maskCanvas   = element[0].querySelector(".ic-mask");
				var clipper      = element[0].querySelector(".ic-clipper");

				var wrapperStyle = {
					position: "relative",
					top: 0,
					left: 0,
					width: 0,
					height: 0
				};

				var canvasStyle = {
					position: "absolute",
					top: 0,
					left: 0,
					width : 0,
					height: 0
				};

				var clipperStyle = {
					position: "absolute",
					width: 0,
					height: 0,
					top: 0,
					left: 0,
				};

				// scope.$watch("image.width", function (newVal, oldVal) {
				// 	if (newVal == oldVal) {
				// 		return;
				// 	}
				// 	updateSize(newVal, scope.image.height);
				// 	$timeout(updateMask);
				// });

				// scope.$watch("image.height", function (newVal, oldVal) {
				// 	if (newVal == oldVal) {
				// 		return;
				// 	}

				// 	updateSize(scope.image.width, newVal);
				// 	$timeout(updateMask);
				// });

				// scope.$watch("image.source", function (newVal, oldVal) {
				// 	if (newVal == oldVal) {
				// 		return;
				// 	}

				// 	updateSize(newVal, scope.image.height);
				// 	updateImage(newVal, sourceCanvas);
				// 	$timeout(updateMask);
				// });


				updateStyle(scope.image.width, scope.image.height);
				updateImage(scope.image.source, sourceCanvas);
				updateMask();

				initClipperEvents();

				function updateStyle (width, height) {
					var rect = calculateWrapperRect(width, height);

					wrapperStyle.top    = rect.top    + "px";
					wrapperStyle.left   = rect.left   + "px";
					wrapperStyle.width  = rect.width  + "px";
					wrapperStyle.height = rect.height + "px";
					angular.element(wrapper).css(wrapperStyle);


					canvasStyle.top    = 0;
					canvasStyle.left   = 0;
					canvasStyle.width  = rect.width  + "px";
					canvasStyle.height = rect.height + "px";

					sourceCanvas.width  = width;
					sourceCanvas.height = height;
					angular.element(sourceCanvas).css(canvasStyle);

					maskCanvas.width  = rect.width;
					maskCanvas.height = rect.height;
					angular.element(maskCanvas).css(canvasStyle);

					var minSize = Math.min(rect.width, rect.height);
					clipperStyle.width  = (minSize - 20) + "px";
					clipperStyle.height = (minSize - 20) + "px";
					if (rect.width > rect.height) {
						clipperStyle.top  = "10px";
						clipperStyle.left = ((rect.width - minSize + 20) / 2) + "px";

					} else {
						clipperStyle.top  = ((rect.height - minSize + 20) / 2) + "px";
						clipperStyle.left = "10px";
					}
					angular.element(clipper).css(clipperStyle);
				}

				function updateMask (x, y, width, height) {
					x      = x != null ? x : parseInt(clipperStyle.left);
					y      = y != null ? y : parseInt(clipperStyle.top);
					width  = width  != null ? width  : parseInt(clipperStyle.width);
					height = height != null ? height : parseInt(clipperStyle.height);

					var context = maskCanvas.getContext("2d");
					context.save();
					context.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
					context.fillStyle = "#fff";
					context.globalAlpha = 0.4;
					context.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
					context.clearRect(x, y, width, height);
					context.restore();
				}

				function calculateWrapperRect (width, height) {
					var style = {
						top: 0,
						left: 0,
						width: 0,
						height: 0,
					};

					if (config.width <= width && height <= height) {
						if (width > height) {
							style.width  = config.width;
							style.height = parseInt(config.width / width  * height);
							style.top    = (config.height - style.height) / 2;
							style.left   = 0;

						} else {
							style.width  = parseInt(config.height / height * width);
							style.height = config.height;
							style.top    = 0;
							style.left   = (config.width - style.width) / 2; 
						}

					} else if (config.width <= width) {
						style.width  = config.width;
						style.height = parseInt(config.width / width * height);
						style.top    = (config.height - style.height) / 2;
						style.left   = 0;

					} else {
						if (width > height) {
							style.width  = config.width;
							style.height = parseInt(width / config.width * height);
							style.top    = (config.height - style.height) / 2;
							style.left   = 0;
						} else {
							style.width  = parseInt(height / config.height * width);
							style.height = config.height;
							style.top    = 0;
							style.left   = (config.width - style.width) / 2; 
						}
					}

					return style;
				}

				function updateImage (imageUrl, canvas) {
					var image = new Image();
					image.src = imageUrl;
					console.log();

					image.onload = function () {
						var context = canvas.getContext("2d");
						context.drawImage(image, 0, 0);
					}
				}

				function initClipperEvents () {
					var $clipper   = angular.element(clipper);
					var dragStart  = false;
					var startPoint = {
						x: 0,
						y: 0
					};
					
					$clipper.on("mousedown", function (event) {
						var clipperWidth  = parseInt(clipperStyle.width);
						var clipperHeight = parseInt(clipperStyle.height);

						if (event.offsetX > 10 
							&& event.offsetY > 10 
							&& event.offsetX < clipperWidth - 10 
							&& event.offsetY < clipperHeight - 10) {
							dragStart = true;
							startPoint = {
								x: event.screenX,
								y: event.screenY
							};
						}
					});

					$clipper.on("mousemove", function (event) {
						if (!dragStart) {
							return;
						}
 
						var wrapperSize  = {
							width : parseInt(wrapperStyle.width),
							height: parseInt(wrapperStyle.height)
						};

						var clipperSize  = {
							width : parseInt(clipperStyle.width),
							height: parseInt(clipperStyle.height)
						};

						var offset = {
							x: event.screenX - startPoint.x,
							y: event.screenY - startPoint.y
						};

						var position = {
							x: parseInt(clipperStyle.left) + offset.x,
							y: parseInt(clipperStyle.top)  + offset.y
						};

						if (position.x < 0) {
							position.x = 0;
						} else if (position.x >  wrapperSize.width - clipperSize.width) {
							position.x = wrapperSize.width - clipperSize.width; 
						}

						if (position.y < 0) {
							position.y = 0;
						} else if (position.y >  wrapperSize.height - clipperSize.height) {
							position.y = wrapperSize.height - clipperSize.height;
						}

						clipperStyle.top  = position.y + "px";
						clipperStyle.left = position.x + "px";

						angular.element(clipper).css(clipperStyle);

						startPoint = {
							x: event.screenX,
							y: event.screenY
						};

						updateMask(	position.x, 
									position.y, 
									clipperSize.width, 
									clipperSize.height);
					});

					$clipper.on("mouseup", function () {
						dragStart = false;
						startPoint = {
							x: 0,
							y: 0
						};
					});

					$clipper.on("mouseleave", function () {
						dragStart = false;
						startPoint = {
							x: 0,
							y: 0
						};
					});

					$clipper.on("mousecancel", function () {
						dragStart = false;
						startPoint = {
							x: 0,
							y: 0
						};
					});
				}
			}
		};
	}
]);