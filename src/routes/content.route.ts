import express, { Request, Response, NextFunction } from 'express';
import ContentsController from '@/controllers/content/contents.controller'
import NewContentController from '@/controllers/content/new-content.controller'
import EditContentController from '@/controllers/content/edit-content.controller'
import ContentController from '@/controllers/content/content.controller'
import CountContentController from '@/controllers/content/count-contents.controller'
import { TParameters } from '@/types/types';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, code, limit } = req.query as {userId: string, projectId: string, code: string, limit: string};

        const parameters: TParameters = {};
        if (limit) {
            parameters.limit = +limit;
        }
        if (code) {
            parameters.code = code;
        }

        const data = await ContentsController({
            userId,
            projectId
        }, parameters);

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.get('/count', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId } = req.query as {userId: string, projectId: string};

        const data = await CountContentController({
            userId,
            projectId
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        let { name, code, entries, sections } = req.body;

        const data = await NewContentController({
            userId,
            projectId,
            name,
            code,
            entries,
            sections
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        let { id, name, code, entries, sections, notifications, translations } = req.body;

        if (id !== req.params.id) {
            throw new Error('Content ID error');
        }

        const data = await EditContentController({
            userId,
            projectId,
            id,
            name,
            code,
            entries,
            sections,
            notifications,
            translations
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        const {id} = req.params;

        const data = await ContentController({
            userId,
            projectId,
            id
        });

        res.json(data);
    } catch (e) {
        let message = String(e);

        if (e instanceof Error) {
            message = e.message; 
        }

        res.json({error: 'server_error', description: message});
    }
});

export default router;