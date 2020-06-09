import React, { PropsWithChildren, useState } from 'react';
import Joi                                    from '@hapi/joi';

export interface IEnvValidatorInputProps {
    schema: Joi.ObjectSchema;
}

export const EnvValidator: React.FC<IEnvValidatorInputProps> = (props: PropsWithChildren<IEnvValidatorInputProps>): React.ReactElement => {

    const [valid, setValidationResult] = useState(null);

    if (valid === null) {
        // Validate provided schema
        const validationResult = props.schema.validate(
            process.env
        );

        // Override env values with schema validation result
        if (validationResult.value) {
            for (const key of Object.keys(validationResult.value)) {
                process.env[key] = validationResult.value[key];
            }
        }

        // Set state
        setValidationResult(validationResult);
        return <>{props.children}</>
    }

    if (valid.error) {

        const errors = valid.error.details.map((errorObject: any): React.ReactNode => (
            <li style={{color: 'red'}}>
                {errorObject.message}
            </li>
        ));
        return <div>
            <h1>An internal configuration error occured</h1>
            <ul>
                {errors}
            </ul>
        </div>

    }

    return <>{props.children}</>

}
