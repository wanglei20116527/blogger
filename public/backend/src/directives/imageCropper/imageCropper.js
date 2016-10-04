angular.module("Backend").directive("imageCropper", [
	"$timeout",
	"$window",
	function ($timeout, $window) {
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

				updateStyle(scope.image.width, scope.image.height);
				updateImage(scope.image.source, sourceCanvas);
				updateMask();

				initEvents();

				window.test = $window;

				function updateStyle (width, height) {
					console.log("width: " + width + " height: " + height);
					var rect = calculateWrapperRect(width, height);
					console.log(rect);
					console.log("\n\n");

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
							style.height = parseInt(config.width / width * height);
							style.top    = (config.height - style.height) / 2;
							style.left   = 0;
						} else {
							style.width  = parseInt(config.height / height * width);
							style.height = config.height;
							style.top    = 0;
							style.left   = (config.width - style.width) / 2; 
						}
					}

					return style;
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

				function updateImage (imageUrl, canvas) {
					var image = new Image();
					image.src = imageUrl;

					image.onload = function () {
						var context = canvas.getContext("2d");
						context.drawImage(image, 0, 0);
					}
				}

				function initEvents () {
					initClipperDragEvents();
					initClipperResizeEvents();
				}

				function initClipperDragEvents () {
					var $clipper   = angular.element(clipper);
					// var dragStart  = false; 
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
							startPoint = {
								x: event.screenX,
								y: event.screenY
							};
							enableDraggable();
						}
					});

					function enableDraggable () {
						var windowEl = angular.element($window);
						windowEl.on("mousemove", dragging);
						windowEl.on("mouseup"  , disableDraggable);
					}

					function disableDraggable () {
						var windowEl = angular.element($window);
						windowEl.off("mousemove", dragging);
						windowEl.off("mouseup"  , disableDraggable);

						startPoint = {
							x: 0,
							y: 0
						};
					}

					function dragging (event) {
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
					}
				}

				function initClipperResizeEvents () {
					var $clipper = angular.element(clipper);
					var $handles = angular.element(clipper.querySelectorAll(".ic-handle"));
					
					var minSize  = {
						width : 64,
						height: 64,
					};

					var direction  = null; 
					var startPoint = {
						x: 0, 
						y: 0
					};

					$handles.on("mousedown", function (event) {
						direction  = event.target.className.replace("ic-handle", "").trim(); 
						startPoint = {
							x: event.screenX,
							y: event.screenY
						};

						initResizable();
					});

					function resize (event) {
						var wrapperSize = {
							width:  parseInt(wrapperStyle.width),
							height: parseInt(wrapperStyle.height)
						};

						var clipperRect = {
							top   : parseInt(clipperStyle.top),
							left  : parseInt(clipperStyle.left),
							width : parseInt(clipperStyle.width),
							height: parseInt(clipperStyle.height)
						};

						var offset = {
							x: event.screenX - startPoint.x,
							y: event.screenY - startPoint.y
						};

						switch (direction) {
							case "left-top":
								if (clipperRect.left + offset.x < 0 
										|| clipperRect.top + offset.y < 0) {
									offset.x = -clipperRect.left;
									offset.y = -clipperRect.top;
									offset.x = offset.y = Math.max(offset.x, offset.y);
								
								} else if (clipperRect.width - offset.x <= minSize.width 
											|| clipperRect.height - offset.y <= minSize.height) {
									offset.x = clipperRect.width  - minSize.width;
									offset.y = clipperRect.height - minSize.height;
									offset.x = offset.y = Math.min(offset.x, offset.y);
								} else {
									offset.x = offset.y = parseInt((offset.x + offset.y) / 2);
								}

								clipperRect.top    += offset.y;
								clipperRect.left   += offset.x;
								clipperRect.width  -= offset.x;
								clipperRect.height -= offset.y;
								break;

							case "top":
								if (clipperRect.top + offset.y < 0 
										|| clipperRect.left + offset.y <= 0) {
									offset.y = -Math.min(clipperRect.top, clipperRect.left);

								} else if (clipperRect.height - offset.y <= minSize.height 
										|| clipperRect.width  - offset.y <= minSize.width) {
									offset.y = clipperRect.height - minSize.height;
									offset.x = clipperRect.width  - minSize.width;

									offset.y = Math.min(offset.y, offset.x);
								}

								offset.x = offset.y;

								clipperRect.top    += offset.y;
								clipperRect.left   += offset.x;
								clipperRect.width  -= offset.x;
								clipperRect.height -= offset.y;
								break;

							case "top-right":
								if (clipperRect.top + offset.y < 0
										|| clipperRect.left + clipperRect.width + offset.x >= wrapperSize.width) {
									offset.x = wrapperSize.width - clipperRect.left - clipperRect.width;
									offset.y = clipperRect.top;
									offset.x = offset.y = Math.min(offset.x, offset.y);
									offset.y = -offset.y;

								} else if (clipperRect.height - offset.y <= minSize.height
										|| clipperRect.width  + offset.x <= minSize.width) {
									offset.y = clipperRect.height - minSize.height;
									offset.x = clipperRect.width  - minSize.width;
									offset.x = offset.y = Math.min(offset.x, offset.y);
									offset.x = -offset.x;
								
								} else {
									offset.x = offset.y = parseInt((offset.y - offset.x) / 2);
									offset.x = -offset.x;
								}

								clipperRect.top    += offset.y;
								clipperRect.width  += offset.x;
								clipperRect.height -= offset.y;
								break;

							case "right":
							case "right-bottom":
							case "bottom":
								if (clipperRect.left + clipperRect.width + offset.x >= wrapperSize.width
										|| clipperRect.top + clipperRect.height + offset.y >= wrapperSize.height) {
									offset.x = wrapperSize.width  - clipperRect.left - clipperRect.width;
									offset.y = wrapperSize.height - clipperRect.top  - clipperRect.height;
									offset.x = offset.y = Math.min(offset.x, offset.y);
								
								} else if (clipperRect.width  + offset.x <= minSize.width 
										|| clipperRect.height + offset.y <= minSize.height) {
									offset.x = minSize.width  - clipperRect.width;
									offset.y = minSize.height - clipperRect.height;
									offset.x = offset.y = Math.max(offset.x, offset.y);

								} else {
									offset.x = offset.y = parseInt((offset.x + offset.y) / 2)
								}

								offset.y = offset.x;

								clipperRect.width  += offset.x;
								clipperRect.height += offset.y;
								break;

							case "bottom-left":
							case "left":
								if (clipperRect.left + offset.x <= 0
										|| clipperRect.top + clipperRect.height + offset.y >= wrapperSize.height) {
									offset.x = clipperRect.left;
									offset.y = wrapperSize.height - clipperRect.top - clipperRect.height;
									offset.y = Math.min(offset.x, offset.y);
									offset.x = -offset.y;
								
								} else if (clipperRect.width  - offset.x <= minSize.width
										|| clipperRect.height + offset.y <= minSize.height) {
									offset.x = clipperRect.width  - minSize.width;
									offset.y = clipperRect.height - minSize.height;
									offset.x = Math.min(offset.x, offset.y);
									offset.y = -offset.x;

								} else {
									offset.x = parseInt((offset.x - offset.y) / 2);
									offset.y = -offset.x;
								}

								clipperRect.left   += offset.x;
								clipperRect.width  -= offset.x;
								clipperRect.height += offset.y;
								break;
						}

						clipperStyle.top    = clipperRect.top    + "px";
						clipperStyle.left   = clipperRect.left   + "px";
						clipperStyle.width  = clipperRect.width  + "px";
						clipperStyle.height = clipperRect.height + "px";
						angular.element(clipper).css(clipperStyle);

						updateMask(	clipperRect.left, 
									clipperRect.top, 
									clipperRect.width, 
									clipperRect.height);

						startPoint.x = event.screenX;
						startPoint.y = event.screenY;
					}

					function initResizable() {
						var windowEl = angular.element($window);

						windowEl.on("mousemove", resize);
						windowEl.on("mouseup"  , stopResizable);
					}

					function stopResizable() {
						direction  = null;
						startPoint = {
							x: 0,
							y: 0,
						};

						var windowEl = angular.element($window);

						windowEl.off("mousemove", resize);
						windowEl.off("mouseup"  , stopResizable);
					}
				}
			}
		};
	}
]);