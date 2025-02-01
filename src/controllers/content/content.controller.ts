import Content from '@/models/content.model'
import { TErrorResponse, TContent, TField, TContentModel } from '@/types/types'

export default async function ContentController(
    {userId, projectId, id}: 
    {userId: string, projectId: string, id: string}
    ): Promise<TErrorResponse | {content: TContent}> {
    try {
        const content: TContentModel|null = await Content.findOne({_id: id, userId, projectId});
        if (!content) {
            throw new Error('invalid content');
        }

        const output = {
            id: content.id,
            name: content.name,
            code: content.code,
            entries: {
                fields: content.entries.fields.map(field => ({
                    id: field.id,
                    type: field.type,
                    name: field.name,
                    key: field.key,
                    description: field.description,
                    validations: field.validations.map(v => ({
                        type: v.type,
                        code: v.code,
                        value: v.value
                    })),
                    params: field.params.map(v => ({
                        type: v.type,
                        code: v.code,
                        value: v.value
                    })),
                    unit: field.unit,
                    system: field.system
                })),
            },
            notifications: content.notifications,
            translations: content.translations,
            sections: {
                enabled: content.sections.enabled,
                fields: content.sections.fields.map(field => ({
                    id: field.id,
                    type: field.type,
                    name: field.name,
                    key: field.key,
                    description: field.description,
                    validations: field.validations.map(v => ({
                        type: v.type,
                        code: v.code,
                        value: v.value
                    })),
                    unit: field.unit,
                    system: field.system
                })),
            }
        };

        return {content: output};
    } catch (error) {
        throw error;
    }
}