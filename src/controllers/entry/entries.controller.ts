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

        const content: TContentModel|null = await Content.findOne({_id: contentId, userId, projectId});
        if (!content) {
            throw new Error('invalid content');
        }

        const entryIndexes: string[] = [];
        let fileIds: string[] = [];
        let entryIds: string[] = [];

        const fileTypes = ['file_reference', 'list.file_reference'];
        const contentRefTypes = ['content_reference', 'list.content_reference'];

        const result = entries.map((entry, i) => {
            const doc = content.entries.fields.reduce((acc: TDoc, field: TFieldOutput) => {
                if (!entry.doc.hasOwnProperty(field.key)) {
                    return acc;
                }

                acc[field.key] = entry.doc[field.key];

                entryIndexes.push(i + ',' + field.key + ',' + field.type);

                if (fileTypes.includes(field.type)) {
                    if (Array.isArray(acc[field.key])) {
                        fileIds = [...fileIds, ...acc[field.key]];
                    } else {
                        fileIds = [...fileIds, acc[field.key]];
                    }
                }
                if (contentRefTypes.includes(field.type)) {
                    if (Array.isArray(acc[field.key])) {
                        entryIds = [...entryIds, ...acc[field.key]];
                    } else {
                        entryIds = [...entryIds, acc[field.key]];
                    }
                }

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

        const files = await (async function() {
            fileIds = fileIds.filter(e => e);
            if (!fileIds.length) {
               return [];
            }

            const resFetchFiles = await fetch(
                `${process.env.URL_FILE_SERVICE}/api/get_files_by_ids?projectId=${projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fileIds})
            });
            const {files}: {files: TFile[]} = await resFetchFiles.json();
            
            return files;
        }());

        const outputEntries = await (async function() {
            entryIds = entryIds.filter(e => e);
            if (!entryIds.length) {
               return [];
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
            }));
            
            return outputEntries;
        }());

        entryIndexes.forEach(i => {
            const [entryIndx, fieldKey, fieldType] = i.split(',');

            if (fileTypes.includes(fieldType)) {
                result[+entryIndx].doc[fieldKey] = Array.isArray(result[+entryIndx].doc[fieldKey]) ? 
                files.filter(file => result[+entryIndx].doc[fieldKey].includes(file.id)) : 
                files.find(file => result[+entryIndx].doc[fieldKey].includes(file.id));
            }
            if (contentRefTypes.includes(fieldType)) {
                result[+entryIndx].doc[fieldKey] = Array.isArray(result[+entryIndx].doc[fieldKey]) ? 
                    outputEntries.filter(entry => result[+entryIndx].doc[fieldKey].includes(entry.id)) : 
                    outputEntries.find(entry => result[+entryIndx].doc[fieldKey].includes(entry.id));
            }
        });

        const fields: TFieldOutput[] = content.entries.fields.map(f => ({key: f.key, name: f.name, type: f.type, params: f.params}));

        return {entries: result, fields};
    } catch (error) {
        throw error;
    }
}