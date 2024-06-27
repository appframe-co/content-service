import express, { Request, Response, NextFunction } from 'express'
import EntriesController from '@/controllers/entry/entries.controller'
import NewEntryController from '@/controllers/entry/new-entry.controller'
import EditEntryController from '@/controllers/entry/edit-entry.controller'
import DeleteEntryController from '@/controllers/entry/delete-entry.controller'
import EntryController from '@/controllers/entry/entry.controller'
import CountEntryController from '@/controllers/entry/count-entries.controller'
import { TEntryInput, TParameters } from '@/types/types'

const router = express.Router();

type TQueryGet = {
    userId: string;
    projectId: string;
    contentId: string;
    limit: string;
    page: string;
    sinceId: string;
    ids: string;
    section_id: string;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, contentId, limit, page, sinceId, ids, section_id:sectionId, ...doc } = req.query as TQueryGet;

        let parameters: TParameters = {};
        if (limit) {
            parameters.limit = +limit;
        }
        if (page) {
            parameters.page = +page;
        }
        if (sinceId) {
            parameters.sinceId = sinceId;
        }
        if (ids) {
            parameters.ids = ids;
        }
        if (sectionId) {
            parameters.sectionId = sectionId;
        }

        if (Object.keys(doc).length) {
            parameters = {...parameters, ...doc};
        }

        const data = await EntriesController({
            userId,
            projectId,
            contentId
        }, 
        parameters);

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
        const { userId, projectId, contentId } = req.query as {userId: string, projectId: string, contentId: string};

        const data = await CountEntryController({
            userId,
            projectId,
            contentId,
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
        let {userId, projectId, contentId, doc, sectionIds}: TEntryInput&{userId: string} = req.body;

        const data = await NewEntryController({
            projectId,
            contentId,
            userId,
            doc, 
            sectionIds
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
        let {id, userId, projectId, contentId, doc, sectionIds}: TEntryInput&{userId: string} = req.body;

        if (req.params.id !== id) {
            throw new Error('id invalid');
        }

        const data = await EditEntryController({
            id,
            projectId,
            contentId,
            userId,
            doc,
            sectionIds
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
        const { userId, projectId, contentId} = req.query as {userId: string, projectId: string, contentId: string};
        const { id } = req.params;

        const data = await EntryController({
            userId,
            projectId,
            contentId,
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

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId } = req.query as {userId: string, projectId: string};
        const { id } = req.params;

        const data = await DeleteEntryController({
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