import { Request, Response } from 'express';
import { FieldInfo, MysqlError } from 'mysql';
import { stringify } from 'querystring';

function getImages(res: Response, amount = 25, offset = 0, filters = '') {
	let fullSize = 0;
	let filterOptions: any = {};

	if (filters !== '') {
		filters = "'" + filters.replaceAll(',', "','") + "'";
	}

	let imageList = Array<{
		id: BigInt;
		url: String;
		channel: String;
		channelId: String;
		category: String;
		guild: String;
		author: String;
	}>();

	let selectCallbackFunction = function (error: MysqlError | null, results: any, fields: FieldInfo[]) {
		if (error !== null) {
			global.logger.error(error);
			return;
		}
		results.forEach((row: any) => {
			imageList.push({
				id: row.attachmentId,
				url: row.attachmentUrl,
				channel: row.channelName?.toString('utf-8'),
				channelId: row.channelId,
				category: row.categoryName?.toString('utf-8'),
				guild: row.guildName,
				author: row.authorName?.toString('utf-8'),
			});
		});

		let pageCount = Math.ceil(fullSize / amount);
		// console.log('Full size: ' + fullSize + '; amount: ' + amount + '; pages: ' + pageCount);

		let prevOffset = offset - 1;
		if (offset <= 1) {
			prevOffset = 0;
		}

		let nextOffset = offset + 1;
		if (offset >= pageCount - 2) {
			nextOffset = pageCount - 1;
		}

		res.status(200).send(
			JSON.stringify({
				prevPage: '/images/' + amount + '/' + prevOffset,
				nextPage: '/images/' + amount + '/' + nextOffset,
				pageCount: pageCount,
				imageList: imageList,
				filterOptions: filterOptions,
			})
		);
	};

	let countCallbackFunction = function (error: MysqlError | null, results: any, fields: FieldInfo[]) {
		results.forEach((row: any) => {
			fullSize = row.count;
		});

		if (filters !== '') {
			global.database.get(
				'allattachments',
				[
					'attachmentId',
					'attachmentUrl',
					'channelName',
					'channelId',
					'categoryName',
					'guildName',
					'authorName',
				],
				'attachmentUrl NOT LIKE ? AND channelId IN(' + filters + ')',
				['%.mp4'],
				selectCallbackFunction,
				amount,
				offset,
				'attachmentId DESC'
			);
		} else {
			global.database.get(
				'allattachments',
				[
					'attachmentId',
					'attachmentUrl',
					'channelName',
					'channelId',
					'categoryName',
					'guildName',
					'authorName',
				],
				'attachmentUrl NOT LIKE ?',
				['%.mp4'],
				selectCallbackFunction,
				amount,
				offset,
				'attachmentId DESC'
			);
		}
	};

	let selectCallbackFunctionFilters = function (error: MysqlError | null, results: any, fields: FieldInfo[]) {
		if (error !== null) {
			global.logger.error(error);
			return;
		}
		results.forEach((row: any) => {
			let catName = row.categoryName.toString('utf-8');
			let chanName = row.channelName.toString('utf-8');
			if (filterOptions[catName] === undefined) {
				filterOptions[catName] = Array<{ name: string; id: string }>();
			}
			filterOptions[catName].push({ name: chanName, id: row.channelId });
			// filterOptions.push({
			// 	name: row.channelName.toString('utf-8'),
			// 	id: row.channelId,
			// 	cat: row.categoryName.toString('utf-8'),
			// });
		});

		if (filters !== '') {
			global.database.count(
				'allattachments',
				'attachmentUrl NOT LIKE ? AND channelId IN(' + filters + ')',
				['%.mp4'],
				countCallbackFunction
			);
		} else {
			global.database.count('allattachments', 'attachmentUrl NOT LIKE ?', ['%.mp4'], countCallbackFunction);
		}
	};

	global.database.getDistinct(
		'allattachments',
		['channelName', 'channelId', 'categoryName'],
		'attachmentUrl NOT LIKE ?',
		['%.mp4'],
		selectCallbackFunctionFilters,
		undefined,
		undefined,
		'categoryName, channelName'
	);
}

global.api.get('/images/api/:amount', (req: Request, res: Response) => {
	getImages(res, parseInt(req.params.amount));
});

global.api.get('/images/api/:amount/:offset', (req: Request, res: Response) => {
	getImages(res, parseInt(req.params.amount), parseInt(req.params.offset) * parseInt(req.params.amount));
});

global.api.get('/images/api/:amount/:offset/:filters', (req: Request, res: Response) => {
	getImages(
		res,
		parseInt(req.params.amount),
		parseInt(req.params.offset) * parseInt(req.params.amount),
		req.params.filters
	);
});
