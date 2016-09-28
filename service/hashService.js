const crypto = require("crypto");
const hash   = crypto.createHash("sha256");

module.exports = {
	hash: function (str) {
		hash.update(str);
		return hash.digest('hex');
	},
};