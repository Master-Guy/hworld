import { Request, Response } from 'express';

global.api.get('/images/css.css', (req: Request, res: Response) => {
	res.status(200).sendFile(global.rootPath + '/api/images/css.css');
});
