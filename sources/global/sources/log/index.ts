let verbose = false;

export const log = (msg: any): void => {
    if (verbose) {
        console.log(msg);
    }
};

export const log_err = (msg: any): void => {
    if (verbose) {
        console.error(msg);
    }
};

export const setVerbosity = (value: boolean): void => {
    verbose = value;
};
