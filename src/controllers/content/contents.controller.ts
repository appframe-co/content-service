import Content from '@/models/content.model';
import Entry from '@/models/entry.model'
import {TErrorResponse, TContent, TSort, TParameters, TContentModel} from '@/types/types';

type TContentsInput = {
    userId: string;
    projectId: string;
}
type TContentsFilter = {
    userId: string;
    projectId: string;
    code?: string;
}

type TOutputContent = TContent & {entriesCount: number}

export default async function Contents(contentInput: TContentsInput, parameters: TParameters = {}): Promise<TErrorResponse | {contents: TOutputContent[]}> {
    try {
        const {userId, projectId} = contentInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId query required');
        }

        const sort: TSort = {};
        const defaultLimit = 10;
        const filter: TContentsFilter = {userId, projectId};
        let {limit=defaultLimit, code} = parameters;

        if (limit > 250) {
            limit = defaultLimit;
        }
        if (code) {
            filter.code = code;
        }

        sort['_id'] = 'asc';
        const contents: TContentModel[] = await Content.find(filter).limit(limit).sort(sort);
        if (!contents) {
            throw new Error('invalid content');
        }

        const output = [];
        for (const content of contents) {
            const entriesCount: number = await Entry.countDocuments({userId, projectId, contentId: content.id});

            output.push({
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
                },
                entriesCount
            });
        }

        return {contents: output};
    } catch (error) {
        throw error;
    }
}