const crypto = require("crypto");

module.exports = {
	hash: function (str) {
		var hash = crypto.createHash("sha256");
		hash.update(str);
		return hash.digest('hex');
	},
};