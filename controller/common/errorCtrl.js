module.exports = function (err, req, res, next) {
    console.error(err);

	if (err.code) {
		res.json({
			success: false,
			error: {
				code: err.code,
				message: err.message || err.stack	
			}
		});
		return;
	}

    if (err.sendStatus === 404) {
        res.render();
        return;
    }

	res.sendStatus(err.statusCode || 500);
};