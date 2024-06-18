import Entry from '@/models/entry.model';
import Content from '@/models/content.model';

import {TEntry, TEntryInput, TDoc, TErrorResponse, TFile, TEntryModel, TParameters, TContentModel} from '@/types/types';

export default async function Entries(entryInput: TEntryInput, parameters: TParameters = {}): Promise<TErrorResponse | {entries: TEntry[], names: string[], keys: string[]}>{
    try {
        const {userId, projectId, contentId} = entryInput;

        if (!userId || !projectId || !contentId) {
            throw new Error('userId & projectId & contentId query required');
        }

        const defaultLimit = 10;

        const filter: any = {createdBy: userId, projectId, contentId};
        let {sinceId, limit=defaultLimit, page=1, ids, sectionId} = parameters;

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
        const names = content.entries.fields.map(b => b.name);
        const keys = content.entries.fields.map(b => b.key);
        const result = entries.map(entry => {
            const doc = keys.reduce((acc: TDoc, key: string) => {
                acc[key] = entry.doc.hasOwnProperty(key) ? entry.doc[key] : null

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
        }

        return {entries: result, names, keys};
    } catch (error) {
        throw error;
    }
}