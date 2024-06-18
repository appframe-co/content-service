import { TSectionModel } from "@/types/types";
import mongoose, { Schema, Document } from "mongoose";

const ObjectId = Schema.ObjectId;

const DocSchema: Schema = new Schema({}, { _id : false, strict: false });
DocSchema.set('toObject', { virtuals: true });
DocSchema.set('toJSON', { virtuals: true });

const SectionsSchema: Schema = new Schema({
    userId: {
        type: ObjectId,
        require: true
    },
    projectId: {
        type: ObjectId,
        require: true
    },
    contentId: {
        type: ObjectId,
        require: true
    },
    parentId: {
        type: ObjectId,
        default: null
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdBy: {
        type: ObjectId,
        required: true
    },
    updatedBy: {
        type: ObjectId,
        required: true
    },
    doc: DocSchema
});

SectionsSchema.set('toObject', { virtuals: true });
SectionsSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Sections || mongoose.model < TSectionModel & Document > ("Sections", SectionsSchema);