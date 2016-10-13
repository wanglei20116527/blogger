const fs = require("fs");

module.exports = {
	exists: function (path) {
		return new Promise((resolve, reject)=>{
			try {
				fs.access(path, err=>{
					resolve(!err);
				});
			} catch (err) {
				reject(err);
			}
		});
	},

	writeFile: function (file, data, options) {
		return new Promise((resolve, reject)=>{
			try {
				fs.writeFile(file, data, options, err=>{
					if (err) {
						reject(err);
						return;
					}

					resolve();
				});
			} catch (err) {
				reject(err);
			}
		});
	}
};