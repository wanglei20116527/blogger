const gm     = require("gm");
const config = require("../config").backend.image;

module.exports = {
	base64ToBuffer (base64) {
		return new Buffer(base64, "base64");
	},
	
	mkThumbnail (sourcePath, targetPath) {
		return new Promise((resolve, reject)=>{
			let {
				width,
				height
			} = config.thumbnail;

			gm(sourcePath).resize(width, height).write(targetPath, err=>{
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});
	}
};
