export interface Theme {
  name: string;
  bigRadius: string;
  biggerSpacing: string;
  componentColor: string;
  componentColorLight: string;
  componentColorLighter: string;
  componentGradientStart: string;
  componentGradientEnd: string;
  darkBg: string;
  defaultRadius: string;
  doubleSpacing: string;
  fontStack: string;
  primaryColor: string;
  primaryColorGradientEnd: string;
  regularSpacing: string;
  smallSpacing: string;
  textColor: string;
  textColorDark: string;
  textColorDarker: string;
  warningColor: string;
}

export interface Themes {
    [key: string]: Theme;
}

export const customThemes: Themes = {
    't721': {
        name: 'T721',
        bigRadius: '32px',
        biggerSpacing: '24px',
        componentColor: 'rgba(255, 255, 255, 0.04)',
        componentColorLight: 'rgba(355, 255, 255, 0.06)',
        componentColorLighter: 'rgba(355, 255, 255, 0.1)',
        componentGradientStart: '#241F33',
        componentGradientEnd: '#1B1726',
        darkBg: '#1B1726',
        defaultRadius: '8px',
        doubleSpacing: '32px',
        fontStack: `'Gordita', Arial, Helvetica, sans-serif`,
        primaryColor: '#079CF0',
        primaryColorGradientEnd: '#2143AB',
        regularSpacing: '16px',
        smallSpacing: '8px',
        textColor: 'rgba(255, 255, 255, 0.9)',
        textColorDark: 'rgba(255, 255, 255, 0.6)',
        textColorDarker: 'rgba(255, 255, 255, 0.38)',
        warningColor: '#C91D31'
    }
};
