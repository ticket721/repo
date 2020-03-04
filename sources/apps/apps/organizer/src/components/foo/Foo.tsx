import React       from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import './Foo.locales';

export interface FooProps extends WithTranslation {
    foo: boolean;
}

export const Foo: React.FC<FooProps> = (props: FooProps): React.ReactElement => {
    const { t } = props;

    return (
        <div>
            <p>Here: {t('test')}</p>
        </div>
    );
};

export default withTranslation('foo')(Foo);
