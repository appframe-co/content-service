import mongoose, { Schema, Document } from "mongoose";
import {TContentModel} from '@/types/types'

const ObjectId = Schema.ObjectId;

const ValidationSchema: Schema = new Schema({
  code: String,
  type: String,
  value: Schema.Types.Mixed
}, { _id : false });

const FieldSchema: Schema = new Schema({
  name: String,
  key: String,
  description: String,
  type: String,
  validations: [ValidationSchema],
  system: Boolean
});

const NotificationSchema: Schema = new Schema({
  new: {
    alert: {
      enabled: Boolean,
      message: String
    }
  }
}, { _id : false });

const TranslationSchema: Schema = new Schema({
  enabled: {
    type: Boolean,
    default: true
  }
});

const SectionSchema: Schema = new Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  fields: {
    type: [FieldSchema],
    default: []
  }
});

const EntrySchema: Schema = new Schema({
  fields: {
    type: [FieldSchema],
    default: []
  }
});

const ContentSchema: Schema = new Schema({
  userId: {
    type: ObjectId,
    require: true
  },
  projectId: {
    type: ObjectId,
    require: true
  },
  name: String,
  code: {
    type: String,
    require: true
  },
  notifications: {
    type: NotificationSchema
  },
  translations: {
    type: TranslationSchema
  },
  entries: {
    type: EntrySchema
  },
  sections: {
    type: SectionSchema
  },
  createdAt: {
    type: Date,
    default: new Date
  },
  updatedAt: {
    type: Date,
    default: new Date
  },
  enabled: {
    type: Boolean,
    default: true
  }
});

ContentSchema.set('toObject', { virtuals: true });
ContentSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Content || mongoose.model < TContentModel & Document > ("Content", ContentSchema);