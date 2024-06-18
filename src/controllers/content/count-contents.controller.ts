import Content from '@/models/content.model';
import {TErrorResponse, TParameters} from '@/types/types';

type TContentsInput = {
    userId: string;
    projectId: string;
}
type TContentsFilter = {
    userId: string;
    projectId: string;
    code?: string;
}

export default async function CountContents(contentInput: TContentsInput, parameters: TParameters = {}): Promise<TErrorResponse | {count: number}> {
    try {
        const {userId, projectId} = contentInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId query required');
        }

        const filter: TContentsFilter = {userId, projectId};
        const count: number = await Content.countDocuments(filter);

        return {count};
    } catch (error) {
        throw error;
    }
}