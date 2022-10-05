import { Request, Response } from 'express';

global.api.get('/images', (req: Request, res: Response) => {
	res.status(200).send(global.functions.readIfExists('/api/images/show.html'));
});
