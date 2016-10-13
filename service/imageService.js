module.exports = {
	base64ToBuffer: function (base64) {
		return new Buffer(base64, "base64");
	}
};