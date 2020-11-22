import { customThemes } from '../../../config/theme';
import { theme } from 'rich-markdown-editor';

export const getEditorTheme = (color?: string) => {
    const primaryColor = color || customThemes.t721.primaryColor.hex;

    return {
        ...theme,
        fontFamily: `
            Gordita,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            'Open Sans',
            'Helvetica Neue',
            sans-serif
        `,
        fontWeight: 400,
        zIndex: 100,
        link: primaryColor,
        background: 'transparent',
        cursor: customThemes.t721.textColor,
        divider: customThemes.t721.textColor,
        placeholder: customThemes.t721.textColorDark,
        text: customThemes.t721.textColor,
        textSecondary: customThemes.t721.textColorDark,
        textLight: customThemes.t721.textColor,
        textHighlight: primaryColor,
        selected: primaryColor,

        toolbarBackground: customThemes.t721.darkerBg,
        toolbarHoverBackground: customThemes.t721.darkBg,
        toolbarInput: customThemes.t721.darkBg,
        toolbarItem: customThemes.t721.textColor,

        blockToolbarBackground: customThemes.t721.darkerBg,
        blockToolbarTrigger: customThemes.t721.darkBg,
        blockToolbarTriggerIcon: primaryColor,
        blockToolbarItem: customThemes.t721.textColor,
        blockToolbarText: customThemes.t721.textColor,
        blockToolbarHoverBackground: customThemes.t721.darkBg,
        blockToolbarDivider: customThemes.t721.textColorDark,

        noticeInfoBackground: customThemes.t721.primaryColorGradientEnd.hex,
        noticeInfoText: customThemes.t721.textColor,
        noticeTipBackground: primaryColor,
        noticeTipText: customThemes.t721.textColor,
        noticeWarningBackground: customThemes.t721.warningColor.hex,
        noticeWarningText: customThemes.t721.textColor,

        tableDivider: customThemes.t721.textColorDark,
        tableSelected: primaryColor,
        tableSelectedBackground: customThemes.t721.componentColorLight,

        quote: customThemes.t721.componentColor,
        horizontalRule: customThemes.t721.componentColorLight,
        imageErrorBackground: customThemes.t721.componentColorLighter,

        scrollbarBackground: customThemes.t721.componentColorLighter,
        scrollbarThumb: customThemes.t721.componentColorLight,

        almostBlack: 'rgb(255,255,0)',
        lightBlack: 'rgb(255,0,255)',
        almostWhite: 'rgb(0,255,255)',
        white: 'rgba(0,255,255, 0.5)',
        white10: 'rgba(0,255,255, 0.2)',

        black: customThemes.t721.textColor,
        black10: 'green',
        primary: primaryColor,
        greyLight: 'red',
        grey: 'rgba(255,0,0,0.5)',
        greyMid: 'rgba(0,255,0,0.5)',
        greyDark: 'rgba(0,9,255,0.5)',
    };
};
