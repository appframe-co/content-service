import Entry from '@/models/entry.model';
import Content from '@/models/content.model';

import {TEntry, TEntryInput, TDoc, TErrorResponse, TFile, TEntryModel, TParameters, TContentModel, TField} from '@/types/types';

type TFieldOutput = Pick<TField, 'type'|'key'|'name'>;

export default async function Entries(entryInput: TEntryInput, parameters: TParameters = {}): Promise<TErrorResponse | {entries: TEntry[], fields: TFieldOutput[]}>{
    try {
        const {userId, projectId, contentId} = entryInput;

        if (!userId || !projectId || !contentId) {
            throw new Error('userId & projectId & contentId query required');
        }

        const defaultLimit = 10;

        let filter: any = {createdBy: userId, projectId, contentId};
        let {sinceId, limit=defaultLimit, page=1, ids, sectionId, searchFieldKey, searchFieldValue, ...doc} = parameters;

        if (limit > 250) {
            limit = defaultLimit;
        }
        if (sinceId) {
            filter['_id'] = {$gt: sinceId};
        }
        if (ids) {
            filter['_id'] = {$in: ids.split(',')};
        }
        if (sectionId) {
            filter['sectionIds'] = {$in: sectionId};
        }
        if (Object.keys(doc).length) {
            filter = {...filter, ...doc};
        }

        if (searchFieldKey && searchFieldValue) {
            const regex = new RegExp("(?<=[-\\s,.:;\"']|^)" + searchFieldValue, 'i');
            filter = {...filter, [`doc.${searchFieldKey}`]: regex};
        }

        const skip = (page - 1) * limit;

        const entries: TEntryModel[] = await Entry.find(filter).skip(skip).limit(limit);
        if (!entries) {
            throw new Error('invalid entries');
        }

        // GET content
        const content: TContentModel|null = await Content.findOne({_id: contentId, userId, projectId});
        if (!content) {
            throw new Error('invalid content');
        }

        // COMPARE entries by content
        const fields: TFieldOutput[] = content.entries.fields.map(f => ({key: f.key, name: f.name, type: f.type, params: f.params}));
        const result = entries.map(entry => {
            const doc = fields.reduce((acc: TDoc, field: TFieldOutput) => {
                acc[field.key] = entry.doc.hasOwnProperty(field.key) ? entry.doc[field.key] : null

                return acc;
            }, {});

            return {
                id: entry.id,
                projectId: entry.projectId,
                contentId: entry.contentId,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
                createdBy: entry.createdBy,
                updatedBy: entry.updatedBy,
                doc,
                sectionIds: entry.sectionIds
            };
        });

        let fileIds: string[] = [];
        const types = ['file_reference', 'list.file_reference'];
        const keyListFile = content.entries.fields.filter(b => types.includes(b.type)).map(b => b.key);
        for (const r of result) {
            for (const key of keyListFile) {
                if (!r.doc[key]) {
                    continue;
                }

                if (Array.isArray(r.doc[key])) {
                    fileIds = [...fileIds, ...r.doc[key]];
                } else {
                    fileIds = [...fileIds, r.doc[key]];
                }
            }
        }

        // MERGE files with entry
        const resFetchFiles = await fetch(
            `${process.env.URL_FILE_SERVICE}/api/get_files_by_ids?projectId=${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({fileIds})
        });
        const {files}: {files: TFile[]} = await resFetchFiles.json();

        let entryIds: string[] = [];
        const keyListContentRef = content.entries.fields
            .filter(b => ['content_reference', 'list.content_reference'].includes(b.type))
            .map(b => b.key);
        for (const r of result) {
            for (const key of keyListContentRef) {
                if (!r.doc[key]) {
                    continue;
                }

                if (Array.isArray(r.doc[key])) {
                    entryIds = [...entryIds, ...r.doc[key]];
                } else {
                    entryIds = [...entryIds, r.doc[key]];
                }
            }
        }
        const refEntries: TEntryModel[]|null = await Entry.find({createdBy: userId, projectId, _id: {$in: entryIds}});
        if (!refEntries) {
            throw new Error('invalid ref entries');
        }
        const outputEntries: TEntry[] = refEntries.map(entry => ({
            id: entry.id,
            projectId: entry.projectId,
            contentId: entry.contentId,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            createdBy: entry.createdBy,
            updatedBy: entry.updatedBy,
            doc: entry.doc,
            sectionIds: entry.sectionIds
        }))

        for (const r of result) {
            for (const key of keyListFile) {
                if (!r.doc[key]) {
                    continue;
                }

                if (Array.isArray(r.doc[key])) {
                    r.doc[key] = files.filter(file => r.doc[key].includes(file.id));
                } else {
                    r.doc[key] = files.find(file => r.doc[key].includes(file.id));
                }
                
            }
            for (const key of keyListContentRef) {
                if (!r.doc[key]) {
                    continue;
                }

                if (Array.isArray(r.doc[key])) {
                    r.doc[key] = outputEntries.filter(entry => r.doc[key].includes(entry.id));
                } else {
                    r.doc[key] = outputEntries.find(entry => r.doc[key].includes(entry.id));
                }
            }
        }

        return {entries: result, fields};
    } catch (error) {
        throw error;
    }
}