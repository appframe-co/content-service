function setOutputOption(v: any=[], msg:string='') {
    const res = Array.isArray(v) ? [v[0], v[1] ? v[1] : msg] : [v, msg];

    res[1] = res[1].replace('#value#', res[0]);

    return res;
}

export function validateString(value: string, options:any={}, msg:any={}): [string[], string|null] {
    const {defaultValue=''} = options;
    let outputValue = value;
    const errors = [];

    const require = setOutputOption(options.required, "Value can't be blank");
    const max = setOutputOption(options.max, 'Value has a maximum of #value#.');
    const min = setOutputOption(options.min, 'Value has a minimum of #value#.');
    const regExp = setOutputOption(options.regex, 'Value has a invalid regExp');
    const enumList = setOutputOption(options.choices, 'Value does not exist in provided choices: [#value#].');

    try {
        const blank = [null, undefined, ''];
        outputValue = (outputValue && typeof outputValue === 'string') ? outputValue.trim() : outputValue;

        if (blank.includes(outputValue)) {
            if (require[0]) {
                errors.push(require[1]);
            }

            if (outputValue === null || outputValue === undefined) {
                return [errors, null];
            }

            outputValue = defaultValue;
        }

        outputValue = outputValue.toString();
        outputValue = outputValue.trim();

        if (max[0] && outputValue.length > max[0]) {
            errors.push(max[1]);
        }

        if (min[0] && outputValue.length < min[0]) {
            errors.push(min[1]);
        }

        if (regExp[0]) {
            const regex = new RegExp(regExp[0]).test(outputValue);
            if (!regex) {
                errors.push(regExp[1]);
            }
        }

        if (enumList[0] && enumList[0].length > 0 && !enumList[0].includes(outputValue)) {
            errors.push(enumList[1]);
        }
    } catch (e) {
        errors.push("should be string");
    } finally {
        return [errors, outputValue];
    }
}