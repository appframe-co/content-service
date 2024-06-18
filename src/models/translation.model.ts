import { TTranslationModel } from "@/types/types";
import mongoose, { Schema, Document } from "mongoose";

const ObjectId = Schema.ObjectId;

const ValueSchema: Schema = new Schema({}, { _id : false, strict: false });
ValueSchema.set('toObject', { virtuals: true });
ValueSchema.set('toJSON', { virtuals: true });

const TranslationsSchema: Schema = new Schema({
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
    subjectId: ObjectId,
    subject: String,
    key: String,
    value: ValueSchema,
    lang: String,
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

TranslationsSchema.set('toObject', { virtuals: true });
TranslationsSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Translations || mongoose.model < TTranslationModel & Document > ("Translations", TranslationsSchema);