import Content from '@/models/content.model';
import Translation from '@/models/translation.model';

import {TErrorResponse, TTranslationInput, TTranslation, TTranslationModel, TValueTranslation, TContentModel} from '@/types/types';

export default async function TranslationController(translationInput: TTranslationInput): Promise<TErrorResponse | {translation: TTranslation}> {
    try {
        const {id, userId, projectId, contentId, subjectId, lang} = translationInput;

        const translation: TTranslationModel|null = await Translation.findOne({_id: id, userId, projectId, contentId, subjectId, lang});
        if (!translation) {
            throw new Error('invalid translation');
        }

        // GET content
        const content: TContentModel|null = await Content.findOne({_id: contentId, userId, projectId});
        if (!content) {
            throw new Error('invalid content');
        }

        // compare translation by content
        const keys = content.entries.fields.map(b => b.key);
        const doc: TValueTranslation = {};
        if (translation.value) {
            keys.forEach(key => {
                doc[key] = translation.value.hasOwnProperty(key) ? translation.value[key] : null;
            });
        }

        const output = {
            id: translation.id,
            userId: translation.userId,
            projectId: translation.projectId,
            contentId: translation.contentId,
            subject: translation.subject,
            subjectId: translation.subjectId,
            lang: translation.lang,
            key: translation.key,
            value: translation.value,
            createdAt: translation.createdAt,
        };
        return {translation: output};
    } catch (error) {
        throw error;
    }
}