const express          = require("express");
const path             = require("path");
const multer           = require("multer");
const config           = require("../../config").backend.fileUpload;
const validation       = require("../../utils/validation");
const pictureCtrl      = require("../../controller/backend/picture/pictureCtrl");
const checkLoginFilter = require("../../filter/checkLoginFilter");

const CACHE_DIR = path.join(process.cwd(), "tmp");

let upload = multer({
	dest: CACHE_DIR,

	limits: {
		fileSize: config.maxFileSize
	}
}).single("picture");

let router = express.Router();

// router.get("/directory/:directory", checkLoginFilter, pictureCtrl.getPicturesUnderDir)

router.get("/", checkLoginFilter, pictureCtrl.getPictures);

router.post("/upload/segment/start", checkLoginFilter, pictureCtrl.startUploadPictureSegment);
router.post("/upload/segment", checkLoginFilter, uploadDelegate, pictureCtrl.uploadPictureSegment);
router.post("/upload/segment/finish", checkLoginFilter, pictureCtrl.finishUploadPictureSegment);
router.post("/upload/segment/abort", checkLoginFilter, pictureCtrl.abortUploadPictureSegment);

router.post("/", checkLoginFilter, pictureCtrl.updatePicture);

router.delete("/:picture", checkLoginFilter, pictureCtrl.deletePicture);

module.exports = router;

function uploadDelegate (req, res, next) {
	upload(req, res, err=>{
		if (err) {
			console.error(err);
			res.sendStatus(500);
			return;
		}

		next();
	});
}