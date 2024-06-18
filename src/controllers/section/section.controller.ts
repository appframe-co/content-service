import Section from '@/models/section.model';
import Content from '@/models/content.model';

import {TErrorResponse, TDoc, TFile, TSection, TSectionModel, TContentModel} from '@/types/types';

type TSectionInput = {
    userId: string;
    projectId: string; 
    contentId: string; 
    id: string;
}

export default async function SectionController(sectionInput: TSectionInput): Promise<TErrorResponse | {section: TSection, files: TFile[]}> {
    try {
        const {id, projectId, userId, contentId} = sectionInput;

        const section: TSectionModel|null = await Section.findOne({createdBy: userId, projectId, _id: id});
        if (!section) {
            throw new Error('invalid section');
        }

        // GET content
        const content: TContentModel|null = await Content.findOne({_id: contentId, userId, projectId});
        if (!content) {
            throw new Error('invalid content');
        }

        // compare section by content
        const keys = content.sections.fields.map(b => b.key);
        const doc: TDoc = {};
        if (section.doc) {
            keys.forEach(key => {
                doc[key] = section.doc.hasOwnProperty(key) ? section.doc[key] : null;
            });
        }

        let fileIds: string[] = [];
        const types = ['file_reference', 'list.file_reference'];
        const keyListFile = content.sections.fields.filter(b => types.includes(b.type)).map(b => b.key);
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

        const output = {
            id: section.id,
            projectId: section.projectId,
            contentId: section.contentId,
            parentId: section.parentId,
            createdAt: section.createdAt,
            updatedAt: section.updatedAt,
            createdBy: section.createdBy,
            updatedBy: section.updatedBy,
            doc
        };
        return {section: output, files};
    } catch (error) {
        throw error;
    }
}