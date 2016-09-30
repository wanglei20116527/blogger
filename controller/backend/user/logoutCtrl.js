module.exports = {
	logout: function (req, res) {
		req.session.destroy(err=>{
			if (err) {
				res.json({
					success: false,
					error: {
						code: 190000,
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