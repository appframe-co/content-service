import { produce } from "immer";
import { validateString } from "./string.validator";
import { validateNumber } from "./number.validator";
import { validateDate } from "./date.validator";
import { validateDateTime } from "./datetime.validator";
import { TOptions } from "@/types/types";

function setOutputOption(v: any=[], msg:string='') {
    const res = Array.isArray(v) ? [v[0], v[1] ? v[1] : msg] : [v, msg];

    res[1] = res[1].replace('#value#', res[0]);

    return res;
}

export function validateArray(value: any, options:TOptions={}) {
    const {value: valueOptions=[], defaultValue=[]} = options;
    let outputValue: any = produce(value, (draft: any) => draft);
    const errors = [];

    const require = setOutputOption(options.required, "Value can't be blank");
    const unique = setOutputOption(options.unique, 'is not unique');
    const maxLength = setOutputOption(options.max, 'Cannot have more than #value# elements');

    try {
        const blank: any = [null, undefined];
        if (Array.isArray(outputValue) && outputValue.length === 0) {
            blank.push(outputValue)
        }

        if (blank.includes(outputValue)) {
            if (require[0]) {
                errors.push(require[1]);
            }

            if (outputValue === null || outputValue === undefined) {
                return [errors, null];
            }

            outputValue = produce(defaultValue, (draft: any) => draft);
        }

        if (!Array.isArray(outputValue)) {
            throw 'should be array';
        }

        if (maxLength[0] && outputValue.length > maxLength[0]) {
            errors.push(maxLength[1]);
        }

        if (unique[0]) {
            const uniqueArray = outputValue.reduce((acc, v) => {
                if (!acc.includes(v)) {
                    acc.push(v)
                }

                return acc;
            }, []);
            if (uniqueArray.length !== outputValue.length) {
                errors.push(unique[1]);
            }
        }

        outputValue = produce(outputValue, (draftStateValue: any) =>
            draftStateValue.map((v: any) => {
                if (valueOptions[0] === 'string') {
                    const [errorsValue, outputValue] = validateString(v, valueOptions[1]);
                    if (errorsValue.length > 0) {
                        errors.push(errorsValue[0]);
                    } else {
                        errors.push('');
                    }

                    return outputValue;
                }
                if (valueOptions[0] === 'number') {
                    const [errorsValue, outputValue] = validateNumber(v, valueOptions[1]);
                    if (errorsValue.length > 0) {
                        errors.push(errorsValue[0]);
                    } else {
                        errors.push('');
                    }

                    return outputValue;
                }
                if (valueOptions[0] === 'datetime') {
                    const [errorsValue, outputValue] = validateDateTime(v, valueOptions[1]);
                    if (errorsValue.length > 0) {
                        errors.push(errorsValue[0]);
                    } else {
                        errors.push('');
                    }

                    return outputValue;
                }
                if (valueOptions[0] === 'date') {
                    const [errorsValue, outputValue] = validateDate(v, valueOptions[1]);
                    if (errorsValue.length > 0) {
                        errors.push(errorsValue[0]);
                    } else {
                        errors.push('');
                    }

                    return outputValue;
                }

                return v;
            }));
    } catch (e) {
        errors.push(e);
    } finally {
        return [errors, outputValue];
    }
}