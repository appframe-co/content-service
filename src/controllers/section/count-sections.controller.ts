import Section from '@/models/section.model';
import {TErrorResponse, TParameters} from '@/types/types';

type TSectionInput = {
    userId: string;
    projectId: string;
    contentId: string;
}

type TSectionFilter = {
    userId: string;
    projectId: string;
    contentId: string;
}

export default async function CountSections(sectionInput: TSectionInput, parameters: TParameters = {}): Promise<TErrorResponse | {count: number}> {
    try {
        const {userId, projectId, contentId} = sectionInput;

        if (!userId || !projectId || !contentId) {
            throw new Error('userId & projectId & contentId query required');
        }

        const filter: TSectionFilter = {userId, projectId, contentId};
        const count: number = await Section.countDocuments(filter);

        return {count};
    } catch (error) {
        throw error;
    }
}