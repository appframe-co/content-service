import { Application } from "express";
import { SortOrder } from "mongoose";

export type RoutesInput = {
  app: Application,
}

export type TErrorResponse = {
  error: string|null;
  description?: string;
  property?: string;
}

type TValidationFieldModel = {
  code: string;
  type: string;
  value: any;
}

export type TSchemaFieldModel = {
  name: string;
  code: string;
  icon: string;
  list: boolean;
  validationDescHtml: string|null;
  validations: TValidationFieldModel[]
}

type TFieldModel = {
  id: string;
  type: string;
  name: string;
  key: string;
  description: string;
  validations: TValidationFieldModel[];
  params: TValidationFieldModel[];
  system: boolean;
  unit: string;
}

export type TContentModel = {
  id: string;
  userId: string;
  projectId: string;
  code: string;
  name: string;
  entries: {
    fields: TFieldModel[];
  },
  sections: {
    enabled: boolean;
    fields: TFieldModel[];
  };
  translations: {
    enabled: boolean;
  };
  notifications: {
    new: {
      alert: {
        enabled: boolean;
        message: string
      }
    }
  };
  createdAt: Date;
  updatedAt: Date;
}

export type TContent = {
  id: string;
  name: string;
  code: string;
  entries: {
    fields: TField[];
  },
  sections: {
    enabled: boolean;
    fields: TField[];
  };
  translations: {
    enabled: boolean;
  };
  notifications: {
    new: {
      alert: {
        enabled: boolean;
        message: string
      }
    }
  };
}

export type TContentInput = {
  userId: string;
  projectId: string;
  id?: string;
  name: string;
  code: string;
  entries?: {
    fields?: {
      type: string;
      name: string;
    }[];
  };
  sections?: {
    enabled: boolean;
    fields: {
      type: string;
      name: string;
    }[];
  };
  translations?: {
    enabled: boolean;
  };
  notifications?: {
    new: {
      alert: {
        enabled: boolean;
        message: string
      }
    }
  };
}

type TValidationSchemaField = {
  code: string;
  name: string;
  desc: string;
  value: any;
  type: string;
  presetChoices: {name: string, value: string}[];
}
export type TSchemaField = {
  id: string;
  type: string;
  name: string;
  code: string;
  icon: string;
  groupCode: string;
  list: string;
  validationDescHtml: string|null,
  validations: TValidationSchemaField[];
}
export type TSchemaFieldOutput = {
  id: string;
  type: string;
  name: string;
  code: string;
  icon: string;
  validations: TValidationField[];
}

type TValidationField = {
  type: string;
  code: string;
  value: any;
}
export type TField = {
  id: string;
  type: string;
  name: string;
  key: string;
  description: string;
  validations: TValidationField[];
}

export type TParameters = {
  limit?: number;
  sinceId?: string;
  code?: string;
  page?: number;
  ids?: string;
  sectionId?: string;
  parentId?: string;
  depthLevel?: number;
  sectionCode?: string;
  searchFieldKey?: string;
  searchFieldValue?: string;
}

export type TSort = {[key: string]: SortOrder};


export type TDoc = {[key: string]: any}

export type TEntryModel = {
  id: string;
  projectId: string;
  userId: string;
  contentId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  doc: TDoc;
  sectionIds: string[];
}

export type TSectionModel = {
  id: string;
  projectId: string;
  userId: string;
  contentId: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  doc: TDoc;
}

export type TEntry = {
  id: string;
  projectId: string;
  contentId: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy: string;
  doc: TDoc;
  sectionIds: string[];
}

export type TSection = {
  id: string;
  projectId: string;
  contentId: string;
  parentId: string|null;
  createdAt?: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy: string;
  doc: TDoc;
  sections?: TSection[];
}

export type TEntryInput = {
	id?: string;
	userId: string; 
	projectId: string;
	contentId: string;
	doc?: TDoc;
  sectionIds?: string[]|string;
}

export type TSectionInput = {
	id?: string;
	userId: string; 
	projectId: string;
	contentId: string;
  parentId?: string;
	doc?: TDoc;
}

export type TFile = {
  id: string;
  filename: string;
  uuidName: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  contentType: string;
  src: string;
}

type TMinNum = number | [number, string];
type TMinDate = Date | [Date, string];

export type TOptions = {
  required?: boolean | [boolean, string];
  unique?: boolean | [boolean, string];
  max?: TMinNum|TMinDate;
  min?: TMinNum|TMinDate;
  regex?: string | [string, string];
  choices?: string[]|number[];
  defaultValue?: any;
  value?: [string, any];
  max_precision?: number;
}




export type TValueTranslation = {[key: string]: any}

export type TTranslationModel = {
  id: string;
  userId: string; 
  projectId: string;
  contentId: string;
  subjectId: string;
  subject: string;
  key: string;
  value: TValueTranslation;
  lang: string;
  createdAt: string;
}

export type TTranslation = {
  id: string;
	userId: string; 
  projectId: string;
  contentId: string;
  subjectId: string;
  subject: string;
  key: string;
  value: TValueTranslation;
  lang: string;
  createdAt?: string;
}

export type TTranslationInput = {
  id?: string;
	userId: string; 
  projectId: string;
  contentId: string;
  subjectId: string;
  subject: string;
  key: string;
  value: TValueTranslation;
  lang: string;
}