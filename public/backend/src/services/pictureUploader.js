angular.module("Backend").service("PictureUploader", [
	"$q",
	"Uuid",
	"Picture",

	function ($q, Uuid, Picture) {
		var SEGMENT_SIZE = 1572864; //1.5M
		var THREAD_POOL_SIZE = 4;
		
		var waitingQueue  = [];
		var uploadingQueue = [];

		var events = {};

		this.uploadPictures = function (pictures, dir) {
			var ids  = [];
			var waitingItems = [];

			dir = angular.copy(dir);

			angular.forEach(pictures || [], function (pic) {
				var id = Uuid.getUuid();
				ids.push(id);

				var file = pic.file;
				delete pic.file;

				pic = angular.copy(pic);

				waitingItems.push({
					id  : id,
					dir : dir,
					pic : pic,
					file: file,
				});
			});

			waitingQueue = waitingQueue.concat(waitingItems);

			startUploadNextPicture();

			return ids;
		};

		this.abortUploadPicture = function (id) {
			var item = null;

			// handle picture in uploadingQueue
			for (var i = 0, len = uploadingQueue.length; i < len; ++i) {
				var uploadingItem = uploadingQueue[i];

				if (uploadingItem.id === id) {
					item = uploadingItem;
					break;
				}
			}

			if (item) {
				abortUploadPictureSegment(item.uploadId).then(function () {
					handleAbort(item);
					removeItemFromUploadingQueue();
					startUploadNextPicture();
				})
				.catch(function (err) {
					handleError(err, item);
					removeItemFromUploadingQueue(item);
					startUploadNextPicture();
					
				});
				return true;
			}

			// handle picture in waitingQueue

			for (var i = 0, len = waitingQueue.length; i < len; ++i) {
				var waitingItem = waitingQueue[i];

				if (waitingItem.id === id) {
					item = waitingItem;
					break;
				}
			}

			if (item) {
				handleAbort(item);
				removeItemFromWaitingQueue(item);
				startUploadNextPicture();
			}

			return false;
		};

		this.onProgress = function (callback) {
			if (events.progress == null) {
				events.progress = [];
			}

			events.progress.push(callback);
		};

		this.offProgress = function (callback) {
			var funcs = events.progress || [];
			
			for (var i = 0, len = funcs.length; i < len; ++i) {
				var func = funcs[i];

				if (func === callback) {
					funcs.splice(i, 1);
					
					--i;
					--len;
				}
			}

			events.progress = funcs;
		};

		this.onComplete = function (callback) {
			if (events.complete == null) {
				events.complete = [];
			}

			events.complete.push(callback);
		};

		this.offComplete = function (callback) {
			var funcs = events.complete || [];
			
			for (var i = 0, len = funcs.length; i < len; ++i) {
				var func = funcs[i];

				if (func === callback) {
					funcs.splice(i, 1);
					
					--i;
					--len;
				}
			}

			events.complete = funcs;
		};

		this.onError = function (callback) {
			if (events.error == null) {
				events.error = [];
			}

			events.error.push(callback);
		};

		this.offError = function (callback) {
			var funcs = events.error || [];
			
			for (var i = 0, len = funcs.length; i < len; ++i) {
				var func = funcs[i];

				if (func === callback) {
					funcs.splice(i, 1);
					
					--i;
					--len;
				}
			}

			events.error = funcs;
		};

		this.onAbort = function (callback) {
			if (events.abort == null) {
				events.abort = [];
			}

			events.abort.push(callback);
		};

		this.offAbort = function () {
			var funcs = events.abort || [];
			
			for (var i = 0, len = funcs.length; i < len; ++i) {
				var func = funcs[i];

				if (func === callback) {
					funcs.splice(i, 1);
					
					--i;
					--len;
				}
			}

			events.abort = funcs;
		};

		function startUploadPictureSegment (item) {
			var dir  = item.dir;
			var pic  = item.pic;
			
			pic.uploaded = 0;
			 
			Picture.startUploadPictureSegment({
				name: pic.name
			}, dir)
			.then(function (id) {
				item.uploadId = id;
				uploadPictureSegment(item);
			})
			.catch(function (err) {
				handleError(err, item);
				removeItemFromUploadingQueue(item);
				startUploadNextPicture();
			});
		}

		function uploadPictureSegment (item) {
			var id       = item.uploadId;
			var file     = item.file;
			var pic      = item.pic;
			var uploaded = pic.uploaded;

			var last  = false;
			var start = uploaded;
			var end   = uploaded + SEGMENT_SIZE;
			
			if (end > file.size) {
				end  = file.size;
				last = true; 
			}

			var blob = file.slice(start, end);

			var promise = Picture.uploadPictureSegment(id, blob);

			promise.then(function (ret) {
				pic.uploaded = ret.acceptedBytes;

				handleProgress(item);
				
				if (last) {
					finishUploadPictureSegment(item);

				} else {
					uploadPictureSegment(item);
				}
			}).catch(function (err) {
				handleError(err, item);
				removeItemFromUploadingQueue(item);
				startUploadNextPicture();
			});

			promise.onProgress(function (uploaded) {
				pic.uploaded += uploaded;

				handleProgress(item);
			});

		}

		function finishUploadPictureSegment (item) {
			var id = item.uploadId;
			
			Picture.finishUploadPictureSegment(id).then(function (pic) {
				handleComplete(item, pic);
				removeItemFromUploadingQueue(item);
				startUploadNextPicture();

			}).catch(function (err) {
				handleError(err, item);
				removeItemFromUploadingQueue(item);
				startUploadNextPicture();
			});
		}

		function startUploadNextPicture () {
			while (uploadingQueue.length < THREAD_POOL_SIZE) {
				if (waitingQueue.length <= 0) {
					break;
				}

				var item = waitingQueue.shift();

				uploadingQueue.push(item);
				startUploadPictureSegment(item);	
			}
		}

		function removeItemFromWaitingQueue (item) {
			for (var i = 0, len = waitingQueue.length; i < len; ++i) {
				var waitingItem = waitingQueue[i];

				if (waitingItem.id === item.id) {
					waitingQueue.splice(i, 1);
					break;
				}
			}
		}

		function removeItemFromUploadingQueue (item) {
			for (var i = 0, len = uploadingQueue.length; i < len; ++i) {
				var uploadingItem = uploadingQueue[i];

				if (uploadingItem.id === item.id) {
					uploadingQueue.splice(i, 1);
					break;
				}
			}
		}

		function handleError (err, item) {
			console.error(err);
			var errFuncs = events.error || [];

			angular.forEach(errFuncs, function (func) {
				func && func(err, item.id);
			});
		}

		function handleProgress (item) {
			var progressFunc = events.progress || [];

			angular.forEach(progressFunc, function (func) {
				var file     = item.file;
				var pic      = item.pic;
				var uploaded = pic.uploaded;

				func && func(item.id, uploaded / file.size);
			});
		}

		function handleComplete (item, pic) {
			var completeFuncs = events.complete || [];

			angular.forEach(completeFuncs, function (func) {
				func && func(item.id, pic);
			});
		}

		function handleAbort (item) {
			var abortFuncs = events.abort || [];
			
			angular.forEach(abortFuncs, function (func) {
				func && func(item.id);
			});
		}
	}
]);