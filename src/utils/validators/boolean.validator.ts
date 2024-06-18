import { TOptions } from "@/types/types";

function setOutputOption(v: any=[], msg:string='') {
    const res = Array.isArray(v) ? [v[0], v[1] ? v[1] : msg] : [v, msg];

    res[1] = res[1].replace('#value#', res[0]);

    return res;
}

export function validateBoolean(value:string|boolean, options:TOptions={}): [string[], number|null] {
    const {defaultValue=false} = options;
    let outputValue: any = value;
    const errors = [];

    const require = setOutputOption(options.required, "Value can't be blank");

    try {
        const blank = [null, undefined];
        if (blank.includes(outputValue)) {
            outputValue = defaultValue;

            if (require[0]) {
                errors.push(require[1]);
            }
        }

        outputValue = Boolean(outputValue);
    } catch (e) {
        errors.push("should be boolean");
    } finally {
        return [errors, outputValue];
    }
}