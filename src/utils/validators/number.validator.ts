import { TOptions } from "@/types/types";

function setOutputOption(v: any=[], msg:string='') {
    const res = Array.isArray(v) ? [v[0], v[1] ? v[1] : msg] : [v, msg];

    res[1] = res[1].replace('#value#', res[0]);

    return res;
}

export function validateNumber(value: string, options:TOptions={}, msg:any={}): [string[], number|null] {
    const {defaultValue=0} = options;
    let outputValue: any = value;
    const errors = [];

    const require = setOutputOption(options.required, "Value can't be blank");
    const max = setOutputOption(options.max, 'Value has a maximum of #value#.');
    const min = setOutputOption(options.min, 'Value has a minimum of #value#.');
    const maxPrecision = setOutputOption(options.max_precision, 'Value can\'t exceed #value# decimal places.');

    try {
        const blank = [null, undefined, NaN, 0, ''];
        if (blank.includes(outputValue)) {
            if (require[0]) {
                errors.push(require[1]);
            }

            if (outputValue === null || outputValue === undefined) {
                return [errors, null];
            }

            outputValue = defaultValue;
        }

        outputValue = Number(outputValue);

        if (isNaN(outputValue)) {
            outputValue = defaultValue;
        }

        if (max[0] && outputValue > max[0]) {
            errors.push(max[1]);
        }
        if (min[0] && outputValue < min[0]) {
            errors.push(min[1]);
        }
        if (maxPrecision[0]) {
            const arNum = (''+outputValue).split('.');
            const num = arNum[1] && arNum[1].split('').length;
            if (maxPrecision[0] < num) {
                errors.push(maxPrecision[1]);
            }
        }
    } catch (e) {
        errors.push("should be number");
    } finally {
        return [errors, outputValue];
    }
}