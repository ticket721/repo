import Joi          from '@hapi/joi';
import { get, set } from 'lodash';

export interface TextMetadata {
    name: string;
    description: string;
    twitter?: string;
    website?: string;
    facebook?: string;
    email?: string;
    linked_in?: string;
    tiktok?: string;
    instagram?: string;
    spotify?: string;
}

export const TextMetadataChecker = Joi.object<TextMetadata>({
    name: Joi
        .string()
        .max(50)
        .min(3)
        .required(),
    description: Joi
        .string()
        .max(10000)
        .allow('')
        .required(),
    instagram: Joi
        .string()
        .optional(),
    twitter: Joi
        .string()
        .optional(),
    tiktok: Joi
        .string()
        .optional(),
    website: Joi
        .string()
        .uri()
        .optional(),
    spotify: Joi
        .string()
        .uri()
        .optional(),
    facebook: Joi
        .string()
        .uri()
        .optional(),
    linked_in: Joi
        .string()
        .uri()
        .optional(),
    email: Joi
        .string()
        .email({
            tlds: { allow: false },
        })
        .optional(),
});

export interface ImagesMetadata {
    avatar: string;
    signatureColors: [string, string];
}

export const ImagesMetadataChecker = Joi.object<ImagesMetadata>({
    avatar: Joi
        .string()
        .uri()
        .required(),
    signatureColors: Joi.array()
        .items(Joi.string().regex(/^#[A-Fa-f0-9]{6}/))
        .min(2)
        .max(2)
        .required(),
});

export interface Location {
    lat: number;
    lon: number;
    label: string;
}

export const LocationChecker = Joi.object<Location>({
    lat: Joi
        .number()
        .required(),
    lon: Joi
        .number()
        .required(),
    label: Joi
        .string()
        .required(),
});

export interface PayloadError {
    type: string;
    context: any;
}

export interface ErrorLeaf {
    reasons: PayloadError[];
}

export interface ErrorNode {
    [key: string]: (ErrorNode | ErrorLeaf);

    [key: number]: (ErrorNode | ErrorLeaf);
}

export const generateErrorFromJoiError = (error: Joi.ValidationError): ErrorNode => {

    const response: ErrorNode = {};

    for (const err of error.details) {

        const path = err.path.join('.');

        const value: ErrorLeaf = get(response, path) as ErrorLeaf;

        if (value === undefined) {

            set(response, path, {
                reasons: [
                    {
                        type: err.type,
                        context: err.context,
                    },
                ],
            });

        } else {

            set(response, path, {
                reasons: [
                    ...value.reasons,
                    {
                        type: err.type,
                        context: err.context,
                    },
                ],
            });
        }
    }

    return response;
};

export const noStringDate = (date: Date | string): Date => {
    if (typeof date === 'string') {
        return new Date(date);
    }
    return date;
}

export const quickError = (code: string, context: any, path: string): ErrorNode => {
    return set({}, path, {
        reasons: [
            {
                type: code,
                context,
            },
        ],
    });
};

