import Translation from '@/models/translation.model';
import {TErrorResponse, TParameters, TTranslation, TTranslationModel} from '@/types/types';

type TTranslationInput = {
    userId: string; 
    projectId: string;
    contentId: string;
    subjectId: string;
    lang: string;
    key: string;
    subject: string;
}
type TPayload = {
    entryIds: string[];
    fileIds: string[];
}

export default async function TranslationsIds(translationInput: TTranslationInput, parameters: TParameters = {}, payload: TPayload): Promise<TErrorResponse | {translations: TTranslation[]}>{
    try {
        const {userId, projectId, contentId, subjectId, lang, key, subject} = translationInput;
        const {entryIds, fileIds} = payload;

        if (!userId || !projectId || !contentId) {
            throw new Error('userId & projectId & contentId query required');
        }

        const defaultLimit = 10;

        const filter: any = {userId, projectId, contentId};
        let {limit=defaultLimit, page=1} = parameters;

        if (limit > 250) {
            limit = defaultLimit;
        }

        if (lang) {
            filter['lang'] = lang;
        }
        if (key) {
            filter['key'] = key;
        }
        if (subject) {
            filter['subject'] = subject;
        }
        if (subjectId) {
            filter['subjectId'] = subjectId;
        }


        if (entryIds) {
            filter['subjectId'] = {$in: entryIds};
        }
        if (fileIds) {
            filter['subjectId'] = {$in: fileIds};
        }
        if (entryIds && fileIds) {
            filter['subjectId'] = {$in: [...entryIds, ...fileIds]};
        }

        const skip = (page - 1) * limit;

        const translations: TTranslationModel[] = await Translation.find(filter).skip(skip).limit(limit);
        if (!translations) {
            throw new Error('invalid translations');
        }

        const output = translations.map(translation => ({
            id: translation.id,
            userId: translation.userId,
            projectId: translation.projectId,
            contentId: translation.contentId,
            subjectId: translation.subjectId,
            subject: translation.subject,
            lang: translation.lang,
            key: translation.key,
            value: translation.value,
            createdAt: translation.createdAt
        }));

        return {translations: output};
    } catch (error) {
        throw error;
    }
}