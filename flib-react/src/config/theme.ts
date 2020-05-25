export interface ColorDefinition {
    hex: string;
    r: number;
    g: number;
    b: number;
}

export interface Theme {
  name: string;
  bigRadius: string;
  biggerSpacing: string;
  componentColor: string;
  componentColorLight: string;
  componentColorLighter: string;
  darkBg: string;
  darkerBg: string;
  defaultRadius: string;
  doubleSpacing: string;
  fontStack: string;
  primaryColor: ColorDefinition;
  primaryColorGradientEnd: ColorDefinition;
  regularSpacing: string;
  smallSpacing: string;
  textColor: string;
  textColorDark: string;
  textColorDarker: string;
  warningColor: ColorDefinition;
  errorColor: ColorDefinition;
  successColor: ColorDefinition;
}

export interface Themes {
    [key: string]: Theme;
}

export const customThemes: Themes = {
    't721': {
        name: 'T721',
        bigRadius: '24px',
        biggerSpacing: '24px',
        componentColor: 'rgba(255, 255, 255, 0.04)',
        componentColorLight: 'rgba(255, 255, 255, 0.06)',
        componentColorLighter: 'rgba(255, 255, 255, 0.1)',
        darkBg: '#241F33',
        darkerBg: '#1B1726',
        defaultRadius: '8px',
        doubleSpacing: '32px',
        fontStack: `'Gordita', Arial, Helvetica, sans-serif`,
        primaryColor: {
            hex: '#079CF0',
            r: 7,
            g: 156,
            b: 240,
        },
        primaryColorGradientEnd: {
            hex: '#2143AB',
            r: 33,
            g: 67,
            b: 171,
        },
        regularSpacing: '16px',
        smallSpacing: '8px',
        textColor: 'rgba(255, 255, 255, 0.9)',
        textColorDark: 'rgba(255, 255, 255, 0.6)',
        textColorDarker: 'rgba(255, 255, 255, 0.38)',
        warningColor: {
            hex: '#C9941D',
            r: 201,
            g: 148,
            b: 29,
        },
        errorColor: {
            hex: '#C91D31',
            r: 201,
            g: 29,
            b: 49,
        },
        successColor: {
            hex: '#1DC96A',
            r: 29,
            g: 201,
            b: 106,
        },
    }
};
