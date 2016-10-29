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

	readFile: function (file, options) {
		return new Promise((resolve, reject)=>{
			try {
				fs.readFile(file, options, (err, data)=>{
					if (err) {
						reject(err);
						return;
					}

					resolve(data);
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
	},

	mkdir: function (path, mode) {
		return new Promise((resolve, reject)=>{
			try {
				fs.mkdir(path, mode, err=>{
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
	},

	mkFile: function (file, mode) {
		return new Promise((resolve, reject)=>{
			try {
				fs.open(file, "w", mode, (err, fd)=>{
					if (err) {
						reject(err);
						return;
					}

					fs.close(fd, err=>{
						if (err) {
							reject(err);s
							return;
						}

						resolve();
					});
				});
			} catch (err) {
				reject(err)
			}
		});
	},

	appendFile: function (file, data, options) {
		return new Promise((resolve, reject)=>{
			try {
				fs.appendFile(file, data, options, err=>{
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
	},

	unlink: function (path) {
		return new Promise((resolve, reject)=>{
			fs.unlink(path, err=>{
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});
	},

	createReadStream: function (path, options) {
		return new Promise((resolve, reject)=>{
			try {
				let rs = fs.createReadStream(path, options);
				resolve(rs);

			} catch (err) {
				reject(err);
			}
		});
	},

	createWriteStream: function (path, options) {
		return new Promise((resolve, reject)=>{
			try {
				let rs = fs.createWriteStream(path, options);
				resolve(rs);

			} catch (err) {
				reject(err);
			}
		});
	},
};