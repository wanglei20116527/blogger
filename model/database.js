let _pool = null;

let database = {
	init: function () {
		return new Promise((resolve, reject)=>{
			try {
				let mysql  = require("mysql");
				let config = require("../config.json").backend.database;
				_pool = mysql.createPool(config);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	},

	getConnection: function () {
		return new Promise((resolve, reject)=>{
			try {
				if (_pool == null) {
					reject(new Error("database not inited"));
					return;
				}

				_pool.getConnection((err, connection)=>{
					if (err) {
						reject(err);
						return;
					}

					resolve(connection);
				});
			} catch (err) {
				reject(err);
			}
		});
	},

	releaseConnection: function (connection) {
		return new Promise((resolve, reject)=>{
			try {
				connection.release();
				resolve();
			} catch (err) {
				reject(err);
			}

		});	
	},

	beginTransaction: function (connection) {
		return new Promise((resolve, reject)=>{
			try {
				connection.beginTransaction(err=>{
					if (err) {
						reject(err);
						return;
					}

					resolve(connection);
				});
			} catch (err) {
				reject(err);
			}
		});
	},

	rollback: function (connection) {
		return new Promise((resolve, reject)=>{
			try {
				connection.rollback(()=>{
					resolve(connection);
				});
			} catch (err) {
				reject(err);
			}
		});
	},

	commit: function (connection) {
		return new Promise((resolve, reject)=>{
			try {
				connection.commit(err=>{
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

	executeSql: function (connection, sql, params) {
		params = params || [];

		return new Promise((resolve, reject)=>{
			try {
				connection.query(sql, params, (err, ret, fields)=>{
					if (err) {
						reject(err);
						return;
					}

					resolve(ret);
				});
			} catch (err) {
				reject(err);
			}
		});
	},

	executeTemplate: function (callback) {
		return new Promise((resolve, reject)=>{
			this.getConnection()
				.then(conn=>{
					conn.beginTransaction(err=>{
						if (err) {
							conn.release();
							reject(err);
							return;
						}

						callback(conn).then(ret=>{
							conn.commit(err=>{
								if (err) {
									conn.rollback(()=>{
										conn.release();
										reject(err);
									});
									return;
								}

								conn.release();
								resolve(ret);
							});
						}).catch(err=>{
							conn.rollback(()=>{
								conn.release();
								reject(err);
							});
						});
					});
				})
				.catch(reject);
		});
	},

	insert: function (connection, tableName, fields, values) {
		values = values || [];
		fields = Object.assign([], fields || []);

		return new Promise((resolve, reject)=>{
			try {
				if (!values || values.length <= 0) {
					resolve();
					return;
				}

				let createTime = updateTime = Date.now();
				let promises   = [];

				fields.push("createTime");
				fields.push("updateTime");

				for (let i = 0, len = values.length; i < len; ++i) {
					let valueObj = values[i];
						valueObj.createTime = createTime;
						valueObj.updateTime = updateTime;

					let [sql, params] = generateInsertData(tableName, fields, valueObj);

					let p = this.executeSql(connection, sql, params);
					promises.push(p);
				}

				Promise.all(promises).then(ret=>{
					for (var i = 0, len = values.length; i < len; ++i) {
						var valueObj = values[i];
						valueObj.id = ret[i].insertId;
					}

					resolve(values);
				}).catch(reject);
			} catch (err) {
				reject(err);
			}
		});
	},

	update: function (connection, tableName, fields, values) {
		values = values || [];
		fields = Object.assign([], fields || []);
		
		return new Promise((resolve, reject)=>{
			try {
				if (!values || values.length <= 0) {
					resolve();
					return;
				}

				let updateTime = Date.now();
				let promises   = [];

				fields.push("updateTime");

				for (let i = 0, len = values.length; i < len; ++i) {
					let valueObj = values[i];
						valueObj.updateTime = updateTime;

					let [sql, params] = generateUpdateData(tableName, valueObj.id, fields, valueObj);

					let p = this.executeSql(connection, sql, params);
					promises.push(p);
				}

				Promise.all(promises).then(ret=>{
					resolve(ret);
				}).catch(reject);
			} catch (err) {
				reject(err);
			}
		});
	},

	delete: function (connection, tableName, fields, values) {
		values = values || [];
		fields = Object.assign([], fields || []);

		return new Promise((resolve, reject)=>{
			try {
				if (!values || values.length <= 0) {
					resolve();
					return;
				}

				let deleteTime = Date.now();
				let promises   = [];

				fields.push("deleteTime");

				for (let i = 0, len = values.length; i < len; ++i) {
					let valueObj = values[i];
						valueObj.deleteTime = deleteTime;

					let [sql, params] = generateUpdateData(tableName, valueObj.id, fields, valueObj);

					let p = this.executeSql(connection, sql, params);
					promises.push(p);
				}

				Promise.all(promises).then(ret=>{
					resolve(ret);
				}).catch(reject);
			} catch (err) {
				reject(err);
			}
		});
	},
};

function generateInsertData (tableName, fields, valueObj) {
	let sql    = "insert into " + tableName + " ";
	let params = [];

	let fieldStr = "";
	let valueStr = "";

	for (let i = 0, len = fields.length; i < len; ++i) {
		let field = fields[i];

		if (i > 0) {
			fieldStr += ", ";	
			valueStr += ", ";
		}

		fieldStr += field;
		valueStr += "?";

		params.push(valueObj[field] == null ? null : valueObj[field]);
	}

	sql += "( " + fieldStr + " )" + " values( " + valueStr + " )";

	return [sql, params];
}

function generateUpdateData (tableName, id, fields, valueObj) {
	let sql    = "update " + tableName + " set ";
	let params = [];

	for (let i = 0, len = fields.length; i < len; ++i) {
		let field = fields[i];

		if (i > 0) {
			sql += ", ";
		}

		sql += field + "=?";

		params.push(valueObj[field] == null ? null : valueObj[field]);
	}

	sql += " where id=?";
	params.push(id);

	return [sql, params];
}

module.exports = database;