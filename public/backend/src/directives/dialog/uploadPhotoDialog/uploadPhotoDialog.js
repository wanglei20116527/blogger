angular.module("Backend").directive("uploadPhotoDialog", [
	"$timeout",
	"$window", 

	function ($timeout, $window) {
		return {
			restrict: 'E',
			scope: {
				image        : "@" ,
				onClose      : "&?",
				onCancel     : "&?",
				onConfirm    : "&?",
				cropperConfig: "=?"
			},
			templateUrl: "/backend/static/src/directives/dialog/uploadPhotoDialog/uploadPhotoDialog.html",
			
			link: function (scope, element, attrs) {
				var cropperConfig = angular.merge({}, scope.cropperConfig || {}, {
					width     : 250,
					height    : 250,
					background: "#000"
				});

				var imageData = {
					source: scope.image,
					width : 0,
					height: 0
				};

				var imageCropper = element[0].querySelector(".image-cropper");
				var imageCropperStyle = {
					position  : "relative",
					width     : cropperConfig.width  + "px",
					height    : cropperConfig.height + "px",
					background: cropperConfig.background
				};
				angular.element(imageCropper).css(imageCropperStyle);

			
				var cropperWrapper      = element[0].querySelector(".ic-wrapper");
				var cropperSourceCanvas = element[0].querySelector(".ic-source");
				var cropperMaskCanvas   = element[0].querySelector(".ic-mask");
				var cropperClipper      = element[0].querySelector(".ic-clipper");

				var cropperWrapperStyle = {
					position: "relative",
					top: 0,
					left: 0,
					width: 0,
					height: 0
				};

				var cropperCanvasStyle = {
					position: "absolute",
					top: 0,
					left: 0,
					width : 0,
					height: 0
				};

				var cropperClipperStyle = {
					position: "absolute",
					width: 0,
					height: 0,
					top: 0,
					left: 0,
				};

				var previewCanvasL = element[0].querySelector(".preview-canvas-l");
				var previewCanvasM = element[0].querySelector(".preview-canvas-m");
				var previewCanvasS = element[0].querySelector(".preview-canvas-s");

				scope.$watch("image", function (newUrl, oldUrl) {
					if (newUrl === oldUrl || newUrl == null) {
						return;
					}
					update();
				});

				scope.close = function () {
					close();
				};

				scope.cancel = function(){
					cancel();
				};

				scope.confirm = function () {
					confirm();
				};

				init();

				function init () {
					var image = new Image();
					
					image.onload = function () {
						imageData = {
							image : image, 
							source: scope.image,
							width : image.width,
							height: image.height
						};

						initCropper();
					};

					image.src = scope.image;
				}

				function update () {
					var image = new Image();
					
					image.onload = function () {
						imageData = {
							source: scope.image,
							width : image.width,
							height: image.height
						};

						updateCropper();
					};

					image.src = scope.image;
				}

				function close () {
					scope.onClose && scope.onClose();
				}

				function cancel () {
					scope.onCancel && scope.onCancel();
				}

				function confirm () {
					if (!scope.onConfirm) {
						return;
					}

					var imageUrl = previewCanvasL.toDataURL("image/png");

					scope.onConfirm({
						image: imageUrl
					});
				}

				function initCropper () {
					updateCropper();
					initCropperEvents();
				}

				function updateCropper() {
					updateCropperStyle(imageData.width, imageData.height);
					updateCropperImage(imageData.source, cropperSourceCanvas);
					updateCropperMask();
				}

				function updatePreviewImage (x, y, width, height) {
					x      = x != null ? x : parseInt(cropperClipperStyle.left, 10);
					y      = y != null ? y : parseInt(cropperClipperStyle.top, 10);
					width  = width  != null ? width  : parseInt(cropperClipperStyle.width, 10);
					height = height != null ? height : parseInt(cropperClipperStyle.height, 10);

					var cropperWrapperWidth = parseInt(cropperWrapperStyle.width, 10);
					var scale = imageData.width / cropperWrapperWidth;

					var imageRect = {
						top   : Math.round(y * scale),
						left  : Math.round(x * scale),
						width : Math.round(width  * scale),
						height: Math.round(height * scale),
					};

					var pclSize = {
						width : previewCanvasL.width,
						height: previewCanvasL.height
					};
					var pclCtx = previewCanvasL.getContext("2d");
					pclCtx.drawImage(
							cropperSourceCanvas, 
							imageRect.left,
							imageRect.top,
							imageRect.width,
							imageRect.height,
							0, 0,
							pclSize.width,
							pclSize.height);


					var pcmSize = {
						width : previewCanvasM.width,
						height: previewCanvasM.height
					};
					var pcmCtx = previewCanvasM.getContext("2d");
					pcmCtx.drawImage(
							cropperSourceCanvas, 
							imageRect.left,
							imageRect.top,
							imageRect.width,
							imageRect.height,
							0, 0,
							pcmSize.width,
							pcmSize.height);

					var pcsSize = {
						width : previewCanvasS.width,
						height: previewCanvasS.height
					};
					var pcsCtx = previewCanvasS.getContext("2d");
					pcsCtx.drawImage(
							cropperSourceCanvas, 
							imageRect.left,
							imageRect.top,
							imageRect.width,
							imageRect.height,
							0, 0,
							pcsSize.width,
							pcsSize.height);
				}

				function updateCropperStyle (width, height) {
					var rect = calculateWrapperRect(width, height);

					cropperWrapperStyle.top    = rect.top    + "px";
					cropperWrapperStyle.left   = rect.left   + "px";
					cropperWrapperStyle.width  = rect.width  + "px";
					cropperWrapperStyle.height = rect.height + "px";
					angular.element(cropperWrapper).css(cropperWrapperStyle);


					cropperCanvasStyle.top    = 0;
					cropperCanvasStyle.left   = 0;
					cropperCanvasStyle.width  = rect.width  + "px";
					cropperCanvasStyle.height = rect.height + "px";

					cropperSourceCanvas.width  = width;
					cropperSourceCanvas.height = height;
					angular.element(cropperSourceCanvas).css(cropperCanvasStyle);

					cropperMaskCanvas.width  = rect.width;
					cropperMaskCanvas.height = rect.height;
					angular.element(cropperMaskCanvas).css(cropperCanvasStyle);

					var minSize = Math.min(rect.width, rect.height);
					cropperClipperStyle.width  = (minSize - 20) + "px";
					cropperClipperStyle.height = (minSize - 20) + "px";
					if (rect.width > rect.height) {
						cropperClipperStyle.top  = "10px";
						cropperClipperStyle.left = ((rect.width - minSize + 20) / 2) + "px";

					} else {
						cropperClipperStyle.top  = ((rect.height - minSize + 20) / 2) + "px";
						cropperClipperStyle.left = "10px";
					}
					angular.element(cropperClipper).css(cropperClipperStyle);
				}

				function calculateWrapperRect (width, height) {
					var style = {
						top: 0,
						left: 0,
						width: 0,
						height: 0,
					};

					if (cropperConfig.width <= width && height <= height) {
						if (width > height) {
							style.width  = cropperConfig.width;
							style.height = parseInt(cropperConfig.width / width  * height);
							style.top    = (cropperConfig.height - style.height) / 2;
							style.left   = 0;

						} else {
							style.width  = parseInt(cropperConfig.height / height * width);
							style.height = cropperConfig.height;
							style.top    = 0;
							style.left   = (cropperConfig.width - style.width) / 2; 
						}

					} else if (cropperConfig.width <= width) {
						style.width  = cropperConfig.width;
						style.height = parseInt(cropperConfig.width / width * height);
						style.top    = (cropperConfig.height - style.height) / 2;
						style.left   = 0;

					} else {
						if (width > height) {
							style.width  = cropperConfig.width;
							style.height = parseInt(cropperConfig.width / width * height);
							style.top    = (cropperConfig.height - style.height) / 2;
							style.left   = 0;
						} else {
							style.width  = parseInt(cropperConfig.height / height * width);
							style.height = cropperConfig.height;
							style.top    = 0;
							style.left   = (cropperConfig.width - style.width) / 2; 
						}
					}

					return style;
				}

				function updateCropperMask (x, y, width, height) {
					x      = x != null ? x : parseInt(cropperClipperStyle.left);
					y      = y != null ? y : parseInt(cropperClipperStyle.top);
					width  = width  != null ? width  : parseInt(cropperClipperStyle.width);
					height = height != null ? height : parseInt(cropperClipperStyle.height);

					var context = cropperMaskCanvas.getContext("2d");
					context.save();
					context.clearRect(0, 0, cropperMaskCanvas.width, cropperMaskCanvas.height);
					context.fillStyle = "#fff";
					context.globalAlpha = 0.4;
					context.fillRect(0, 0, cropperMaskCanvas.width, cropperMaskCanvas.height);
					context.clearRect(x, y, width, height);
					context.restore();
				}

				function updateCropperImage (imageUrl, canvas) {
					var ctx = canvas.getContext("2d");
					ctx.drawImage(imageData.image, 0, 0);

					updatePreviewImage();
				}

				function initCropperEvents () {
					initClipperDragEvents();
					initClipperResizeEvents();
				}

				function initClipperDragEvents () {
					var $clipper   = angular.element(cropperClipper);
					var startPoint = {
						x: 0,
						y: 0
					};
					
					$clipper.on("mousedown", function (event) {
						var clipperWidth  = parseInt(cropperClipperStyle.width);
						var clipperHeight = parseInt(cropperClipperStyle.height);

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
							width : parseInt(cropperWrapperStyle.width),
							height: parseInt(cropperWrapperStyle.height)
						};

						var clipperSize  = {
							width : parseInt(cropperClipperStyle.width),
							height: parseInt(cropperClipperStyle.height)
						};

						var offset = {
							x: event.screenX - startPoint.x,
							y: event.screenY - startPoint.y
						};

						var position = {
							x: parseInt(cropperClipperStyle.left) + offset.x,
							y: parseInt(cropperClipperStyle.top)  + offset.y
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

						cropperClipperStyle.top  = position.y + "px";
						cropperClipperStyle.left = position.x + "px";

						angular.element(cropperClipper).css(cropperClipperStyle);

						startPoint = {
							x: event.screenX,
							y: event.screenY
						};

						updateCropperMask(
									position.x, 
									position.y, 
									clipperSize.width, 
									clipperSize.height
								);

						updatePreviewImage(
									position.x,
									position.y,
									clipperSize.width,
									clipperSize.height);
					}
				}

				function initClipperResizeEvents () {
					var $clipper = angular.element(cropperClipper);
					var $handles = angular.element(cropperClipper.querySelectorAll(".ic-handle"));
					
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
							width:  parseInt(cropperWrapperStyle.width),
							height: parseInt(cropperWrapperStyle.height)
						};

						var clipperRect = {
							top   : parseInt(cropperClipperStyle.top),
							left  : parseInt(cropperClipperStyle.left),
							width : parseInt(cropperClipperStyle.width),
							height: parseInt(cropperClipperStyle.height)
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

						cropperClipperStyle.top    = clipperRect.top    + "px";
						cropperClipperStyle.left   = clipperRect.left   + "px";
						cropperClipperStyle.width  = clipperRect.width  + "px";
						cropperClipperStyle.height = clipperRect.height + "px";
						angular.element(cropperClipper).css(cropperClipperStyle);

						updateCropperMask(	
									clipperRect.left, 
									clipperRect.top, 
									clipperRect.width, 
									clipperRect.height
								);

						updatePreviewImage(
									clipperRect.left, 
									clipperRect.top, 
									clipperRect.width, 
									clipperRect.height
								);

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