function header_value_processor(inputHeaders) {

    const headers = [];

    for (const header of inputHeaders) {
        if (/^\$ENV:/.test(header.value)) {
            const envValue = process.env[header.value.slice(5)];

            if (envValue === undefined) {
                throw new Error(`Cannot resolve header env value ${header.value.slice(5)}`);
            }

            headers.push({
                name: header.name,
                value: envValue,
            });
        } else {
            headers.push({
                name: header.name,
                value: header.value,
            });
        }
    }

    return headers;
}

module.exports = {
    header_value_processor,
};
