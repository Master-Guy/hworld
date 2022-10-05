import { Request, Response } from 'express';

global.api.get('/images/js.js', (req: Request, res: Response) => {
	res.status(200).send(global.functions.readIfExists('/api/images/js.js'));
});
