import { FieldMetaProps } from 'formik';
import './errorLocales';
import i18n from '@frontend/core/lib/utils/i18n';

export const evaluateError = <FieldType>(meta: FieldMetaProps<FieldType>, nestedPath?: any): string => {
    if (meta.touched && meta.error) {
        if (nestedPath !== undefined && !(meta.error as any)[nestedPath]) {
            return;
        }

        const rawError = nestedPath ?
            (meta.error as any)[nestedPath].reasons[0] :
            (meta.error as any).reasons[0];

        return i18n.t(rawError.type.replace('.', ':').replaceAll('.', '_'), rawError.context);
    }
}
