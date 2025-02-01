import Entry from '@/models/entry.model';
import Content from '@/models/content.model'

import {TEntry, TEntryInput, TErrorResponse, TDoc, TFile, TEntryModel, TContentModel} from '@/types/types';

export default async function EntryController(entryInput: TEntryInput): Promise<TErrorResponse | {entry: TEntry, files: TFile[], entries: TEntry[]}> {
    try {
        const {id, projectId, userId, contentId} = entryInput;

        const entry: TEntryModel|null = await Entry.findOne({createdBy: userId, projectId, _id: id});
        if (!entry) {
            throw new Error('invalid entry');
        }

        // GET content
        const content: TContentModel|null = await Content.findOne({_id: contentId, userId, projectId});
        if (!content) {
            throw new Error('invalid content');
        }

        // compare entry by content
        const keys = content.entries.fields.map(b => b.key);
        const doc: TDoc = {};
        if (entry.doc) {
            keys.forEach(key => {
                doc[key] = entry.doc.hasOwnProperty(key) ? entry.doc[key] : null;
            });
        }

        let fileIds: string[] = [];
        const types = ['file_reference', 'list.file_reference'];
        const keyListFile = content.entries.fields.filter(b => types.includes(b.type)).map(b => b.key);
        for (const key of keyListFile) {
            if (!doc[key]) {
                continue;
            }

            if (Array.isArray(doc[key])) {
                fileIds = [...fileIds, ...doc[key]];
            } else {
                fileIds = [...fileIds, doc[key]];
            }
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

        let entryIds: string[] = [];
        const keyListContentRef = content.entries.fields
            .filter(b => ['content_reference', 'list.content_reference'].includes(b.type))
            .map(b => b.key);
        for (const key of keyListContentRef) {
            if (!doc[key]) {
                continue;
            }

            if (Array.isArray(doc[key])) {
                entryIds = [...entryIds, ...doc[key]];
            } else {
                entryIds = [...entryIds, doc[key]];
            }
        }

        const entries: TEntryModel[]|null = await Entry.find({createdBy: userId, projectId, _id: {$in: entryIds}});
        if (!entries) {
            throw new Error('invalid entries');
        }
        const outputEntries: TEntry[] = entries.map(entry => ({
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

        const output = {
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
        return {entry: output, files, entries: outputEntries};
    } catch (error) {
        throw error;
    }
}