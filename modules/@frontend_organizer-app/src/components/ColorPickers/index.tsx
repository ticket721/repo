import React, { Dispatch, useEffect, useState } from 'react';
import styled                                   from 'styled-components';
import {
    ColorPicker,
    Icon,
} from '@frontend/flib-react/lib/components';

import { ColorResult }                                 from 'react-color';
import Vibrant                                         from 'node-vibrant';

import { useTranslation } from 'react-i18next';
import './locales';
import '@frontend/core/lib/components/ToastStacker/locales';

export interface ColorPickersProps {
    name?: string;
    srcImage?: string;
    value: [string, string];
    onChange: (palette: [string, string]) => void;
}

export const ColorPickers: React.FC<ColorPickersProps> = (props: ColorPickersProps) => {
    const [ t ] = useTranslation('color_pickers');

    const [ presetColors, setPresetColors ]: [ string[], Dispatch<string[]> ] = useState([]);

    const generatePresetColors = (src: string) => {
        Vibrant.from(src)
            .getPalette()
            .then((palette) => {
                if (!props.value || (props.value[0] === '' && props.value[1] === '')) {
                    props.onChange([
                        palette.Vibrant.getHex(),
                        palette.Muted.getHex()
                    ]);
                }

                setPresetColors([
                    palette.LightVibrant.getHex(),
                    palette.LightMuted.getHex(),
                    palette.Vibrant.getHex(),
                    palette.Muted.getHex(),
                    palette.DarkVibrant.getHex(),
                    palette.DarkMuted.getHex(),
                ]);
            });
    };

    useEffect(() => {
        if (props.srcImage) {
            generatePresetColors(props.srcImage);
        }
        // eslint-disable-next-line
    }, [props.srcImage]);

    return (
        <Colors id={props.name}>
            <ColorPicker
                label={t('primary_color')}
                presetLabel={t('color_suggestions')}
                presetColors={presetColors}
                color={props.value[0]}
                handleChange={(color: ColorResult) => props.onChange([color.hex, props.value[1]])}
            />
            <div onClick={() => props.onChange([props.value[1], props.value[0]])}>
                <Icon
                    icon={'swap'}
                    size={'22px'}
                    color={'#CCC'}/>
            </div>
            <ColorPicker
                label={t('secondary_color')}
                presetLabel={t('color_suggestions')}
                presetColors={presetColors}
                color={props.value[1]}
                handleChange={(color: ColorResult) => props.onChange([props.value[0], color.hex])}
            />
        </Colors>
    );
};

const Colors = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    & > div:first-child,
    & > div:last-child {
        width: calc(50% - 25px);
    }
`;
