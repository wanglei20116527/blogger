module.exports = {
	logout: function (req, res) {
		req.session.destroy(err=>{
			if (err) {
				res.json({
					success: false,
					error: {
						code: err.code,
						message: err.stack,
					}
				});
			} else {
				res.json({
					success: true
				});
			}
		});
	}
};