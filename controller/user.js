let user = {
	login: function (req, res, next) {
		
	},

	logout: function (req, res) {
		req.session.destroy(err=>{
			if (err) {

			} else {

			}
		});
	}
};

module.exports = user;