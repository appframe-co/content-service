import Section from '@/models/section.model';
import { TErrorResponse, TSectionModel } from '@/types/types';

type TSectionInput = {
    userId: string;
    projectId: string; 
    id: string;
}
export default async function DeleteSection(sectionInput: TSectionInput): Promise<TErrorResponse | {}> {
    try {
        const {userId, projectId, id} = sectionInput;

        if (!id) {
            throw new Error('invalid request');
        }

        const section: TSectionModel|null  = await Section.findOneAndDelete({
            createdBy: userId, 
            projectId, 
            _id: id
        }, {});
        if (!section) {
            throw new Error('invalid section');
        }

        return {};
    } catch (error) {
        throw error;
    }
}