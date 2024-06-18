import Entry from '@/models/entry.model';
import { TEntryModel, TEntryInput, TErrorResponse } from '@/types/types';

export default async function DeleteEntry(entryInput: Omit<TEntryInput, 'contentId'>): Promise<TErrorResponse | {}> {
    try {
        const {userId, projectId, id} = entryInput;

        if (!id) {
            throw new Error('invalid request');
        }

        const entry: TEntryModel|null  = await Entry.findOneAndDelete({
            createdBy: userId, 
            projectId, 
            _id: id
        }, {});
        if (!entry) {
            throw new Error('invalid entry');
        }

        return {};
    } catch (error) {
        throw error;
    }
}