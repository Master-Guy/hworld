import { Request, Response } from 'express';

global.api.get('/images/joinbutton.png', (req: Request, res: Response) => {
	res.status(200).sendFile(global.rootPath + '/api/images/joinbutton.png');
});
