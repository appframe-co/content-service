import Content from '@/models/content.model';
import { TContentInput, TContent, TField, TContentModel } from '@/types/types';
import { validateArray } from '@/utils/validators/array.validator';
import { validateBoolean } from '@/utils/validators/boolean.validator';
import { validateDate } from '@/utils/validators/date.validator';
import { validateDateTime } from '@/utils/validators/datetime.validator';
import { validateNumber } from '@/utils/validators/number.validator';
import { validateString } from '@/utils/validators/string.validator';

import { checkUnique } from '@/utils/unique';

function isErrorContent(data: null|TContentModel): data is null {
    return (data as null) === null;
}

export default async function CreateContent(contentInput: TContentInput): Promise<{content: TContent|null, userErrors: any}> {
    try {
        const {userId, projectId, ...contentBody} = contentInput;

        if (!userId || !projectId) {
            throw new Error('userId & projectId required');
        }

        const {errors: errorsForm, data: validatedData} = await (async (data) => {
            try {
                const errors: any = [];
                const output: any = {};

                output.content = await (async function() {
                    const content: any = {};

                    const {name} = data;
                    const [errorsName, valueName] = validateString(name, {required: true, min: 3, max: 255});
                    if (errorsName.length > 0) {
                        errors.push({field: ['name'], message: errorsName[0]}); 
                    }
                    content.name = valueName;

                    const {code} = data;
                    const [errorsCode, valueCode] = validateString(code, {
                        required: true,
                        min: 3,
                        max: 255,
                        regex: [
                            new RegExp('^[a-z0-9\-_]+$'),
                            "Code can’t include spaces or special characters (i.e. $ # !)"
                        ]
                    });
                    if (errorsCode.length > 0) {
                        errors.push({field: ['code'], message: errorsCode[0]}); 
                    }
                    const isUniquie: boolean|null = await checkUnique(valueCode, {projectId, subject:'content', key: 'code'});
                    if (isUniquie === false) {
                        errors.push({field: ['code'], message: 'Code must be unique'});
                    }
                    content.code = valueCode;

                    if (data.hasOwnProperty('entries')) {
                        const {entries} = data;
                        if (entries !== undefined && entries !== null) {
                            content['entries'] = {};

                            if (entries.hasOwnProperty('fields')) {
                                const {fields} = entries;

                                if (fields !== undefined && fields !== null) {
                                    const [errorsFields, valueFields] = validateArray(fields, {required: true, max: 10});
                                    if (errorsFields.length > 0) {
                                        errors.push({field: ['entries', 'fields'], message: errorsFields[0]});
                                    }
                                    content.entries.fields = valueFields.map((v:any, k:number) => {
                                        const {type, name, key, description, validations, unit} = v;
                                        let output = {};

                                        const [errorsType, valueType] = validateString(type,
                                            {required: true, choices: [[
                                                'single_line_text', 'multi_line_text', 'rich_text',
                                                'number_integer', 'number_decimal',
                                                'date_time', 'date',
                                                'file_reference',
                                                'list.single_line_text', 'list.number_integer', 'list.number_decimal', 'list.date_time', 'list.date', 'list.file_reference', 'list.color', 'list.url', 'list.dimension', 'list.volume', 'list.weight',
                                                'url_handle', 'color', 'boolean', 'money', 'url', 'dimension', 'volume', 'weight'
                                            ]]}
                                        );
                                        if (errorsType.length > 0) {
                                            errors.push({field: ['entries', 'fields', k, 'type'], message: errorsType[0]});
                                        }

                                        const [errorsName, valueName] = validateString(name, {required: true, max: 255});
                                        if (errorsName.length > 0) {
                                            errors.push({field: ['entries', 'fields', k, 'name'], message: errorsName[0]}); 
                                        }

                                        const [errorsKey, valueKey] = validateString(key, {
                                            required: true, 
                                            min: 3,
                                            max: 64,
                                            regex: [
                                                new RegExp('^[a-z0-9\-_]+$'),
                                                "Key can’t include spaces or special characters (i.e. $ # !)"
                                            ]
                                        });
                                        if (errorsKey.length > 0) {
                                            errors.push({field: ['entries', 'fields', k, 'key'], message: errorsKey[0]}); 
                                        }

                                        const [errorsDescription, valueDescription] = validateString(description, {max: 100});
                                        if (errorsDescription.length > 0) {
                                            errors.push({field: ['entries', 'fields', k, 'description'], message: errorsDescription[0]}); 
                                        }

                                        if (v.hasOwnProperty('unit')) {
                                            const [errorsUnit, valueUnit] = validateString(unit, {max: 255});
                                            if (errorsUnit.length > 0) {
                                                errors.push({field: ['entries', 'fields', k, 'unit'], message: errorsUnit[0]}); 
                                            }
                                            output = {...output, unit: valueUnit};
                                        }

                                        const validatedValidations = validations.map((v:any, j:number) => {
                                            const {code, value, type} = v;

                                            const codes = ['required', 'unique', 'choices', 'max', 'min', 'regex', 'max_precision', 'field_reference', 'transliteration'];
                                            const [errorsCode, valueCode] = validateString(code,{required: true, choices: [codes]});
                                            if (errorsCode.length > 0) {
                                                errors.push({field: ['entries', 'fields', k, 'validations', j, 'code'], message: errorsCode[0]});
                                            }

                                            const types = ['checkbox', 'text', 'number', 'date_time', 'date', 'list.text'];
                                            const [errorsType, valueType] = validateString(type, {required: true, choices: [types]});
                                            if (errorsType.length > 0) {
                                                errors.push({field: ['entries', 'fields', k, 'validations', j, 'type'], message: errorsType[0]});
                                            }

                                            const [errorsValue, valueValue] = (function() {
                                                if (valueCode === 'required') {
                                                    return validateBoolean(value);
                                                }
                                                if (valueCode === 'unique') {
                                                    return validateBoolean(value);
                                                }
                                                if (valueCode === 'min') {
                                                    if (v.type === 'date_time') {
                                                        return validateDateTime(value);
                                                    }
                                                    if (v.type === 'date') {
                                                        return validateDate(value);
                                                    }
                                                    return validateNumber(value, {min: [0, "Validations contains an invalid value: 'min' must be positive."]});
                                                }
                                                if (valueCode === 'max') {
                                                    if (v.type === 'date_time') {
                                                        return validateDateTime(value);
                                                    }
                                                    if (v.type === 'date') {
                                                        return validateDate(value);
                                                    }
                                                    return validateNumber(value, {min: [0, "Validations contains an invalid value: 'max' must be positive."]});
                                                }
                                                if (valueCode === 'max_precision') {
                                                    return validateNumber(value, {
                                                        max: [9, "Validations 'max_precision' can't exceed the precision of 9."], 
                                                        min: [0, "Validations 'max_precision' can't be a negative number."]
                                                    });
                                                }
                                                if (valueCode === 'regex') {
                                                    return validateString(value, {max: 255});
                                                }
                                                if (valueCode === 'choices') {
                                                    return validateArray(value, {
                                                        unique: [true, "Validations has duplicate choices."], 
                                                        max: [5, "Validations contains a lot of choices."],
                                                        value: ['string', {
                                                            max: [255, "Validations contains an invalid value."]
                                                        }]
                                                    });
                                                }
                                                if (valueCode === 'field_reference') {
                                                    return validateString(value);
                                                }
                                                if (valueCode === 'transliteration') {
                                                    return validateBoolean(value);
                                                }

                                                return [[], null];
                                            }());
                                            if (errorsValue.length > 0) {
                                                if (valueCode === 'choices') {
                                                    for (let i=0; i < errorsValue.length; i++) {
                                                        if (!errorsValue[i]) {
                                                            continue;
                                                        }
                                                        errors.push({field: ['entries', 'fields', k, 'validations', j, 'value', i], message: errorsValue[i]}); 
                                                    }
                                                } else {
                                                    errors.push({field: ['entries', 'fields', k, 'validations', j, 'value'], message: errorsValue[0]}); 
                                                }
                                            }

                                            return {
                                                type: valueType,
                                                code: valueCode,
                                                value: valueValue,
                                            };
                                        });

                                        output = {
                                            ...output,
                                            type: valueType,
                                            name: valueName,
                                            key: valueKey,
                                            description: valueDescription,
                                            validations: validatedValidations
                                        };

                                        return output;
                                    });
                                }
                            }
                        }
                    }

                    if (data.hasOwnProperty('sections')) {
                        const {sections} = data;
                        if (sections !== undefined && sections !== null) {
                            content['sections'] = {};

                            if (sections.hasOwnProperty('enabled')) {
                                const {enabled} = sections;
                                if (enabled !== undefined && enabled !== null) {
                                    const [errorsEnabled, valueEnabled] = validateBoolean(sections.enabled);
                                    if (errorsEnabled.length > 0) {
                                        errors.push({field: ['sections', 'enabled'], message: errorsEnabled[0]}); 
                                    }
                                    content.sections.enabled = valueEnabled;
                                }
                            }
                            if (sections.hasOwnProperty('fields')) {
                                const {fields} = sections;
                                if (fields !== undefined && fields !== null) {
                                    const [errorsFields, valueFields] = validateArray(fields, {required: true, max: 10});
                                    if (errorsFields.length > 0) {
                                        errors.push({field: ['sections', 'fields'], message: errorsFields[0]});
                                    }

                                    content.sections.fields = valueFields.map((v:any, k:number) => {
                                        const {type, name, key, description, validations, system, unit} = v;
                                        let output = {};
                
                                        const [errorsType, valueType] = validateString(type,
                                            {required: true, choices: [[
                                                'single_line_text', 'multi_line_text', 'rich_text',
                                                'number_integer', 'number_decimal',
                                                'date_time', 'date',
                                                'file_reference',
                                                'list.single_line_text', 'list.number_integer', 'list.number_decimal', 'list.date_time', 'list.date', 'list.file_reference', 'list.color', 'list.url', 'list.dimension', 'list.volume', 'list.weight',
                                                'url_handle', 'color', 'boolean', 'money', 'url', 'dimension', 'volume', 'weight'
                                            ]]}
                                        );
                                        if (errorsType.length > 0) {
                                            errors.push({field: ['sections', 'fields', k, 'type'], message: errorsType[0]});
                                        }
                
                                        const [errorsName, valueName] = validateString(name, {required: true, max: 255});
                                        if (errorsName.length > 0) {
                                            errors.push({field: ['sections', 'fields', k, 'name'], message: errorsName[0]}); 
                                        }
                
                                        const [errorsKey, valueKey] = validateString(key, {
                                            required: true, 
                                            min: 3,
                                            max: 64,
                                            regex: [
                                                new RegExp('^[a-z0-9\-_]+$'),
                                                "Key can’t include spaces or special characters (i.e. $ # !)"
                                            ]
                                        });
                                        if (errorsKey.length > 0) {
                                            errors.push({field: ['sections', 'fields', k, 'key'], message: errorsKey[0]}); 
                                        }
                                        if (valueFields.filter((v:any) => v.key === valueKey).length > 1) {
                                            errors.push({field: ['sections', 'fields', k, 'key'], message: 'Value must be unique'});
                                        }
                
                                        const [errorsDescription, valueDescription] = validateString(description, {max: 100});
                                        if (errorsDescription.length > 0) {
                                            errors.push({field: ['sections', 'fields', k, 'description'], message: errorsDescription[0]}); 
                                        }

                                        if (v.hasOwnProperty('unit')) {
                                            const [errorsUnit, valueUnit] = validateString(unit, {max: 255});
                                            if (errorsUnit.length > 0) {
                                                errors.push({field: ['fields', k, 'unit'], message: errorsUnit[0]}); 
                                            }
                                            output = {...output, unit: valueUnit};
                                        }

                                        const validatedValidations = validations.map((v:any, j:number) => {
                                            const {code, value, type} = v;
                
                                            const codes = ['required', 'unique', 'choices', 'max', 'min', 'regex', 'max_precision', 'field_reference', 'transliteration'];
                                            const [errorsCode, valueCode] = validateString(code, {required: true, choices: [codes]});
                                            if (errorsCode.length > 0) {
                                                errors.push({field: ['sections', 'fields', k, 'validations', j, 'code'], message: errorsCode[0]});
                                            }
                
                                            const types = ['checkbox', 'text', 'number', 'date_time', 'date', 'list.text'];
                                            const [errorsType, valueType] = validateString(type, {required: true, choices: [types]});
                                            if (errorsType.length > 0) {
                                                errors.push({field: ['sections', 'fields', k, 'validations', j, 'type'], message: errorsType[0]});
                                            }
                
                                            const [errorsValue, valueValue] = (function() {
                                                if (valueCode === 'required') {
                                                    return validateBoolean(value);
                                                }
                                                if (valueCode === 'unique') {
                                                    return validateBoolean(value);
                                                }
                                                if (valueCode === 'min') {
                                                    if (v.type === 'date_time') {
                                                        return validateDateTime(value);
                                                    }
                                                    if (v.type === 'date') {
                                                        return validateDate(value);
                                                    }
                                                    return validateNumber(value, {min: [0, "Validations contains an invalid value: 'min' must be positive."]});
                                                }
                                                if (valueCode === 'max') {
                                                    if (v.type === 'date_time') {
                                                        return validateDateTime(value);
                                                    }
                                                    if (v.type === 'date') {
                                                        return validateDate(value);
                                                    }
                                                    return validateNumber(value, {min: [0, "Validations contains an invalid value: 'max' must be positive."]});
                                                }
                                                if (valueCode === 'max_precision') {
                                                    return validateNumber(value, {
                                                        max: [9, "Validations 'max_precision' can't exceed the precision of 9."], 
                                                        min: [0, "Validations 'max_precision' can't be a negative number."]
                                                    });
                                                }
                                                if (valueCode === 'regex') {
                                                    return validateString(value, {max: 255});
                                                }
                                                if (valueCode === 'choices') {
                                                    return validateArray(value, {
                                                        unique: [true, "Validations has duplicate choices."], 
                                                        max: [5, "Validations contains a lot of choices."],
                                                        value: ['string', {
                                                            max: [255, "Validations contains an invalid value."]
                                                        }]
                                                    });
                                                }
                                                if (valueCode === 'field_reference') {
                                                    return validateString(value);
                                                }
                                                if (valueCode === 'transliteration') {
                                                    return validateBoolean(value);
                                                }
                
                                                return [[], null];
                                            }());
                                            if (errorsValue.length > 0) {
                                                if (valueCode === 'choices') {
                                                    for (let i=0; i < errorsValue.length; i++) {
                                                        if (!errorsValue[i]) {
                                                            continue;
                                                        }
                                                        errors.push({field: ['sections', 'fields', k, 'validations', j, 'value', i], message: errorsValue[i]}); 
                                                    }
                                                } else {
                                                    errors.push({field: ['sections', 'fields', k, 'validations', j, 'value'], message: errorsValue[0]}); 
                                                }
                                            }
                
                                            return {
                                                type: valueType,
                                                code: valueCode,
                                                value: valueValue,
                                            };
                                        });

                                        const [errorsSystem, valueSystem] = validateBoolean(system);
                                        if (errorsSystem.length > 0) {
                                            errors.push({field: ['sections', 'fields', k, 'system'], message: errorsSystem[0]}); 
                                        }

                                        output = {
                                            ...output,
                                            type: valueType,
                                            name: valueName,
                                            key: valueKey,
                                            description: valueDescription,
                                            validations: validatedValidations,
                                            system: valueSystem
                                        };

                                        return output;
                                    });
                                }
                            }
                        }
                    }

                    return content;
                }());

                return {errors, data: output};
            } catch (e) {
                let message = 'Error';
                if (e instanceof Error) {
                    message = e.message;
                }

                return {errors: [{message}]};
            }
        })(contentBody);
        if (Object.keys(errorsForm).length > 0) {
            return {
                content: null,
                userErrors: errorsForm
            };
        }

        const {errors: errorsDB, data: savedData} = await (async (data) => {
            try {
                const errors: any = [];
                const output: any = {};

                const content: TContentModel|null = await Content.create({
                    userId, 
                    projectId, 
                    ...data.content
                });
                if (isErrorContent(content)) {
                    throw new Error('invalid content');
                }

                const {id: contentId} = content;
                output.contentId = contentId;

                if (errors.length > 0) {
                    return {errors};
                }

                return {errors, data: output};
            } catch (e) {
                let message;
                if (e instanceof Error) {
                    message = e.message;
                }
                return {errors: [{message}]};
            }
        })(validatedData);
        if (Object.keys(errorsDB).length > 0) {
            return {
                content: null,
                userErrors: errorsDB
            }
        }

        const {errors: errorsRes, data: obtainedData} = await (async (data): Promise<{errors: any, data: {content: TContent|null}}> => {
            try {
                const errors: any = [];
                let output: {content: TContent|null} = {content: null};

                const {contentId} = data;

                const content: TContentModel|null = await Content.findOne({userId, projectId, _id: contentId});
                if (isErrorContent(content)) {
                    output.content = null;
                } else {
                    output.content = {
                        id: content.id, 
                        name: content.name, 
                        code: content.code,
                        entries: {
                            fields: content.entries.fields.map(field => ({
                                id: field.id,
                                type: field.type,
                                name: field.name,
                                key: field.key,
                                description: field.description,
                                validations: field.validations.map(v => ({
                                    type: v.type,
                                    code: v.code,
                                    value: v.value
                                })),
                            })),
                        },
                        notifications: content.notifications,
                        translations: content.translations,
                        sections: content.sections
                    }
                }

                return {errors, data: output};
            } catch (e) {
                let message;
                if (e instanceof Error) {
                    message = e.message;
                }
                return {errors: [{message}], data: {content: null}};
            }
        })(savedData);
        if (Object.keys(errorsRes).length > 0) {
            return {
                content: null,
                userErrors: errorsRes
            }
        }

        return {
            content: obtainedData.content,
            userErrors: []
        };
    } catch (e) {
        let message;
        if (e instanceof Error) {
            message = e.message;
        }
        return {
            content: null,
            userErrors: [{message}]
        };
    }
}