import { TOptions } from "@/types/types";

function setOutputOption(v: any=[], msg:string='') {
    const res = Array.isArray(v) ? [v[0], v[1] ? v[1] : msg] : [v, msg];

    res[1] = res[1].replace('#value#', res[0]);

    return res;
}

export function validateDateTime(value:string, options:TOptions={}, msg:any={}): [string[], string|null] {
    const {defaultValue=''} = options;
    let outputValue:any = value;
    const errors = [];

    const require = setOutputOption(options.required, "Value can't be blank");
    const max = setOutputOption(options.max, 'Value has a maximum of #value#.');
    const min = setOutputOption(options.min, 'Value has a minimum of #value#.');

    try {
        const blank = [null, undefined, NaN, ''];
        if (blank.includes(outputValue && new Date(outputValue).getTime())) {
            if (require[0]) {
                errors.push(require[1]);
            }

            if (outputValue === null || outputValue === undefined) {
                return [errors, null];
            }

            const deafultDate = new Date(defaultValue);
            outputValue = (deafultDate instanceof Date && !isNaN(deafultDate.getTime())) ? deafultDate : new Date();
        }

        outputValue = new Date(outputValue);

        if (max[0]) {
            const maxDate = new Date(max[0]);
            if (maxDate instanceof Date && !isNaN(maxDate.getTime())) {
                if (outputValue.getTime() > maxDate.getTime()) {
                    errors.push(max[1]);
                }
            }
        }

        if (min[0]) {
            const minDate = new Date(min[0]);
            if (minDate instanceof Date && !isNaN(minDate.getTime())) {
                if (outputValue.getTime() < minDate.getTime()) {
                    errors.push(min[1]);
                }
            }
        }

        return [errors, outputValue.toJSON().slice(0, 16)];
    } catch (e) {
        let message = 'should be date';
        if (e instanceof Error) {
            message = e.message;
        }

        let output = outputValue;

        if (outputValue instanceof Date && !isNaN(outputValue.getTime())) {
            output = outputValue.toJSON().slice(0, 16);
        }

        return [[message], output];
    }
}