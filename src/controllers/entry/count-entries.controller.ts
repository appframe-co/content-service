import Entry from '@/models/entry.model';
import {TErrorResponse, TParameters} from '@/types/types';

type TEntryInput = {
    userId: string;
    projectId: string;
    contentId: string;
}

type TEntryFilter = {
    userId: string;
    projectId: string;
    contentId: string;
}

export default async function CountEntries(entryInput: TEntryInput, parameters: TParameters = {}): Promise<TErrorResponse | {count: number}> {
    try {
        const {userId, projectId, contentId} = entryInput;

        if (!userId || !projectId || !contentId) {
            throw new Error('userId & projectId & contentId query required');
        }

        const filter: TEntryFilter = {userId, projectId, contentId};
        const count: number = await Entry.countDocuments(filter);

        return {count};
    } catch (error) {
        throw error;
    }
}