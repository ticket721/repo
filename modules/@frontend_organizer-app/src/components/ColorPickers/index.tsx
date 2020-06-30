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
    srcImage?: string;
    colors: string[];
    onColorsChange: (palette: string[]) => void;
}

export const ColorPickers: React.FC<ColorPickersProps> = (props: ColorPickersProps) => {
    const [ t ] = useTranslation('color_pickers');

    const [ presetColors, setPresetColors ]: [ string[], Dispatch<string[]> ] = useState([]);

    const generatePresetColors = (src: string) => {
        Vibrant.from(src)
            .getPalette()
            .then((palette) => {
                props.onColorsChange([
                    palette.Vibrant.getHex(),
                    palette.Muted.getHex(),
                ]);

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

    const updateColor = (updateIdx: number, updatedColor: ColorResult) => {
        props.onColorsChange(props.colors.map((color: string, idx: number) =>
            updateIdx === idx ? updatedColor.hex : color
        ));
    };

    useEffect(() => {
        if (!props.colors && props.srcImage) {
            generatePresetColors(props.srcImage);
        }

        setPresetColors([]);
        // eslint-disable-next-line
    }, [props.srcImage, props.colors]);

    return (
        <Colors>
            <ColorPicker
                label={t('primary_color')}
                presetLabel={t('color_suggestions')}
                presetColors={presetColors}
                color={props.colors[0]}
                handleChange={(color: ColorResult) => updateColor(0, color)}
            />
            <div onClick={() => props.onColorsChange([props.colors[1], props.colors[0]])}>
                <Icon
                    icon={'swap'}
                    size={'22px'}
                    color={'#CCC'}/>
            </div>
            <ColorPicker
                label={t('secondary_color')}
                presetLabel={t('color_suggestions')}
                presetColors={presetColors}
                color={props.colors[1]}
                handleChange={(color: ColorResult) => updateColor(1, color)}
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
