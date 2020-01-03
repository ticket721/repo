export interface EmailDriverOptions {
    template: string;
    to: string;
    locale: string;
    locals: any;
    preview?: boolean;
}

export abstract class EmailDriver {
    public abstract async send(options: EmailDriverOptions): Promise<void>;
}
