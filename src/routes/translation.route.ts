import express, { Request, Response, NextFunction } from 'express'
import TranslationsController from '@/controllers/translation/translations.controller'
import NewTranslationController from '@/controllers/translation/new-translation.controller'
import EditTranslationController from '@/controllers/translation/edit-translation.controller'
import { TParameters, TTranslationInput } from '@/types/types'

const router = express.Router();

type TQueryGet = {
    userId: string;
    projectId: string;
    contentId: string;
    subjectId: string;
    lang: string;
    key: string;
    limit: string;
    page: string;
    subject:string;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, projectId, contentId, subjectId, lang, limit=10, page=1, key, subject } = req.query as TQueryGet;

        const parameters: TParameters = {};
        if (limit) {
            parameters.limit = +limit;
        }
        if (page) {
            parameters.page = +page;
        }

        const data = await TranslationsController({
            userId,
            projectId,
            contentId,
            subjectId,
            lang,
            key,
            subject
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

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {userId, projectId, contentId, subjectId, subject, lang, key, value}: TTranslationInput = req.body;

        const data = await NewTranslationController({
            userId,
            projectId,
            contentId,
            subjectId,
            key,
            lang,
            subject,
            value
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
        let {id, userId, projectId, contentId, subjectId, subject, lang, key, value}: TTranslationInput = req.body;

        if (req.params.id !== id) {
            throw new Error('id invalid');
        }

        const data = await EditTranslationController({
            id,
            userId,
            projectId,
            contentId,
            subjectId,
            key,
            lang,
            subject,
            value
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