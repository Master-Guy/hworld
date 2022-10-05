import { FieldInfo, MysqlError, PoolConnection, Query } from 'mysql';

let Database = class {
	constructor() {}

	private provider = require('mysql');

	private connectionPool = this.provider
		.createPool({
			connectionLimit: 10,
			port: global.settings.MySQLport,
			user: global.settings.MySQLuser,
			password: global.settings.MySQLpass,
			database: global.settings.MySQLdatabase,
			supportBigNumbers: true,
			bigNumberStrings: true,
		})
		.on('acquire', function (connection: PoolConnection) {
			global.logger.trace('Connection %d acquired', connection.threadId);
		})
		.on('connection', function (connection: PoolConnection) {
			global.logger.trace('Setting auto_increment to 1');
			connection.query('SET SESSION auto_increment_increment=1');
		})
		.on('enqueue', function () {
			global.logger.trace('Waiting for available connection slot');
		})
		.on('release', function (connection: PoolConnection) {
			global.logger.trace('Connection %d released', connection.threadId);
		});

	get query() {
		return this.connectionPool.query;
	}

	public count = function (
		p_category: string,
		p_filter: string,
		p_filterValues: Array<any>,
		p_callback: Function
	): Object | undefined {
		let getObject = {};
		let cntFilters = (p_filter.match(/\?/g) || []).length;
		if (cntFilters > 0) {
			if (cntFilters !== p_filterValues.length) {
				global.logger.trace(p_filter);
				global.logger.trace(p_filterValues);
				global.logger.error('Database query with invalid filter and filter values!');
				return undefined;
			}
			let fullQuery = 'SELECT count(*) as `count` FROM ?? WHERE ' + p_filter;
			let fullFilters = [p_category, ...p_filterValues];
			global.database.connectionPool.query(
				'SELECT count(*) as `count` FROM ?? WHERE ' + p_filter,
				[p_category, ...p_filterValues],
				p_callback
			);
		} else {
			global.database.connectionPool.query('SELECT count(*) as `count` FROM ?? ', [p_category], p_callback);
		}
		return getObject;
	};

	public get = function (
		p_category: string,
		p_fields: Array<string>,
		p_filter: string,
		p_filterValues: Array<any>,
		p_callback: Function,
		p_limit?: number,
		p_offset?: number,
		p_orderby?: string
	): Object | undefined {
		let orderBy = '';
		if (p_orderby !== undefined) {
			orderBy = ' ORDER BY ' + p_orderby;
		}
		let limit = '';
		if (p_limit !== undefined && p_limit > 0) {
			limit = ' LIMIT ' + p_limit;
			if (p_offset !== undefined && p_offset > 0) {
				limit += ' OFFSET ' + p_offset;
			}
		}
		let getObject = {};
		let cntFilters = (p_filter.match(/\?/g) || []).length;
		if (cntFilters > 0) {
			if (cntFilters !== p_filterValues.length) {
				global.logger.trace(p_filter);
				global.logger.trace(p_filterValues);
				global.logger.error('Database query with invalid filter and filter values!');
				return undefined;
			}
			global.database.connectionPool.query(
				'SELECT ?? FROM ?? WHERE ' + p_filter + orderBy + limit,
				[p_fields, p_category, p_filterValues],
				p_callback
			);
		} else {
			global.database.connectionPool.query(
				'SELECT ?? FROM ?? ' + orderBy + limit,
				[p_fields, p_category],
				p_callback
			);
		}
		return getObject;
	};

	public getDistinct = function (
		p_category: string,
		p_fields: Array<string>,
		p_filter: string,
		p_filterValues: Array<any>,
		p_callback: Function,
		p_limit?: number,
		p_offset?: number,
		p_orderby?: string
	): Object | undefined {
		let orderBy = '';
		if (p_orderby !== undefined) {
			orderBy = ' ORDER BY ' + p_orderby;
		}
		let limit = '';
		if (p_limit !== undefined && p_limit > 0) {
			limit = ' LIMIT ' + p_limit;
			if (p_offset !== undefined && p_offset > 0) {
				limit += ' OFFSET ' + p_offset;
			}
		}
		let getObject = {};
		let cntFilters = (p_filter.match(/\?/g) || []).length;
		if (cntFilters > 0) {
			if (cntFilters !== p_filterValues.length) {
				global.logger.trace(p_filter);
				global.logger.trace(p_filterValues);
				global.logger.error('Database query with invalid filter and filter values!');
				return undefined;
			}
			global.database.connectionPool.query(
				'SELECT DISTINCT ?? FROM ?? WHERE ' + p_filter + orderBy + limit,
				[p_fields, p_category, p_filterValues],
				p_callback
			);
		} else {
			global.database.connectionPool.query(
				'SELECT DISTINCT ?? FROM ?? ' + orderBy + limit,
				[p_fields, p_category],
				p_callback
			);
		}
		return getObject;
	};

	public insert = function (p_category: string, objValues: Object, p_callback: Function) {
		global.database.connectionPool.query('INSERT INTO ?? SET ?', [p_category, objValues], p_callback);
	};

	public upsert = function (p_category: string, objValues: Object, p_callback: Function) {
		global.database.connectionPool.query(
			'INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?',
			[p_category, objValues, objValues],
			p_callback
		);
	};

	public delete = function (p_category: string, p_filter: string, p_filterValues: Array<any>, p_callback: Function) {
		let deletedRows = 0;
		let callbackFunction = (err: any, result: any) => {
			deletedRows = result.affectedRows;
			if (p_callback !== undefined) {
				p_callback(err, result);
			}
		};
		let cntFilters = (p_filter.match(/\?/g) || []).length;
		if (cntFilters > 0) {
			if (cntFilters !== p_filterValues.length) {
				global.logger.trace(p_filter);
				global.logger.trace(p_filterValues);
				global.logger.error(
					`Database query with invalid filter and filter values! (${cntFilters} vs ${p_filterValues.length})`
				);
				return 0;
			}
			global.database.connectionPool.query(
				'DELETE FROM ?? WHERE ' + p_filter,
				[p_category, p_filterValues],
				callbackFunction
			);
		} else {
			global.database.connectionPool.query('DELETE FROM ??', p_category, callbackFunction);
		}
		return deletedRows;
	};

	public update = function (
		p_category: string,
		p_fields: string,
		p_fieldValues: Array<any>,
		p_filter: string,
		p_filterValues: Array<any>,
		p_callback: Function
	) {
		let changedRows = 0;
		let callbackFunction = (err: any, result: any) => {
			changedRows = result.affectedRows;
			if (p_callback !== undefined) {
				p_callback(err, result);
			}
		};
		let cntFields = (p_fields.match(/\?/g) || []).length;
		if (cntFields !== p_fieldValues.length) {
			global.logger.trace(cntFields);
			global.logger.trace(p_fieldValues);
			global.logger.error('Database update query with invalid fields and fields values!');
			return 0;
		}
		let cntFilters = (p_filter.match(/\?/g) || []).length;
		if (cntFilters > 0) {
			if (cntFilters !== p_filterValues.length) {
				global.logger.trace(p_filter);
				global.logger.trace(p_filterValues);
				global.logger.error('Database update query with invalid filter and filter values!');
				return 0;
			}
			global.database.connectionPool.query(
				'UPDATE ?? SET ' + p_fields + ' WHERE ' + p_filter,
				[p_category, ...p_fieldValues, ...p_filterValues],
				callbackFunction
			);
		} else {
			global.database.connectionPool.query(
				'UPDATE ?? SET ' + p_fields,
				[p_category, p_fieldValues],
				callbackFunction
			);
		}
		return changedRows;
	};
};

module.exports = Database;
