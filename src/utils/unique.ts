import { TContentModel, TEntryModel, TSectionModel } from "@/types/types";
import Content from '@/models/content.model';
import Entry from '@/models/entry.model';
import Section from '@/models/section.model';

type TPayload = {
    projectId: string;
    contentId?: string;
    subjectId?: string;
    subject: string
    key: string;
}

export async function checkUnique(value: string|null, payload: TPayload): Promise<boolean|null> {
    try {
        const { projectId, contentId, key, subjectId, subject } = payload;

        if (!projectId || !subjectId || !key) {
            throw new Error('projectId & ssubjectId & key is required');
        }

        const filter: {[key:string]: any} = {projectId, [key]: value};
        if (subjectId) {
            filter['_id'] = {$ne: subjectId};
        }

        if (subject === 'section') {
            filter.contentId = contentId;
            const section: TSectionModel|null = await Section.findOne(filter);
            if (section) {
                return false;
            }
        }

        if (subject === 'entry') {
            filter.contentId = contentId;
            const entry: TEntryModel|null = await Entry.findOne(filter);
            if (entry) {
                return false;
            }
        }

        if (subject === 'content') {
            const content: TContentModel|null = await Content.findOne(filter);
            if (content) {
                return false;
            }
        }

        return true;
    } catch (e) {
        return null;
    }
}