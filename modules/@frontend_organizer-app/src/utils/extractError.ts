import { FieldMetaProps } from 'formik';
import './errorLocales';
import i18n from '@frontend/core/lib/utils/i18n';

export const evaluateError = <FieldType>(meta: FieldMetaProps<FieldType>): string => {
    if (meta.touched && meta.error) {
        const rawError = (meta.error as any).reasons[0].type;
        return i18n.t(rawError.replace('.', ':').replaceAll('.', '_'), (meta.error as any).reasons[0].context);
    }
}
