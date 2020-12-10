import React from 'react';
import { SelectableList } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import { useHaptics, HapticsImpactStyle } from '../../../hooks/useHaptics';
import './locales';

const Language: React.FC = () => {
    const [t, i18n] = useTranslation('language');
    const haptics = useHaptics();

    const setLanguage = (lang: string) => i18n.changeLanguage(lang);

    return (
        <div style={{ width: '100vw' }}>
            <SelectableList
                title={t('title')}
                items={[
                    {
                        label: t('en_select'),
                        value: 'en',
                    },
                    {
                        label: t('fr_select'),
                        value: 'fr',
                    },
                ]}
                selected={i18n.language.slice(0, 2)}
                update={(lang: string) => {
                    haptics.impact({
                        style: HapticsImpactStyle.Light,
                    });
                    setLanguage(lang);
                }}
            />
        </div>
    );
};

export default Language;
