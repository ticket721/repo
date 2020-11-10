import React                                                  from 'react';
import styled                                                 from 'styled-components';
import { detect }                                             from 'detect-browser';
import { useTranslation }                                     from 'react-i18next';
import { Drawer as MUIDrawer, DrawerProps as MUIDrawerProps } from '@material-ui/core';
import { blurAndDarkenBackground }                            from '@frontend/core/lib/utils/style';
import { useHistory }                                         from 'react-router';
import { ArrowBackIos }                                       from '@material-ui/icons';
import ProfileRoot                                            from '@frontend/core/lib/components/Profile/Root';
import Language                                               from '@frontend/core/lib/components/Profile/Language';
import '../Translations/global';

export type ProfileRoute = 'root' | 'activities' | 'language';

interface DrawerAccountProps {
    route: ProfileRoute;
    onClose: () => void;
}

export const DrawerAccount: React.FC<DrawerAccountProps> = ({route, onClose}: DrawerAccountProps) => {
    const [t] = useTranslation('global');
    const history = useHistory();
    const browser = detect();

    return (
        <Drawer anchor='right' open={route !== null} onClose={onClose} browsername={browser?.name}>
            {
                route === 'root' ?
                    <ProfileRoot desktop={true}/> :
                    null
            }
            {
                route === 'language' ?
                    <>
                        <BackArrow
                            onClick={() => history.push(history.location.pathname + '?profile=root')}>
                            <ArrowBackIos />
                            <span>{t('back')}</span>
                        </BackArrow>
                        <Language/>
                    </> :
                    null
            }
        </Drawer>
    );
};

interface DrawerProps extends MUIDrawerProps {
    browsername: string | undefined;
}

const Drawer = styled(MUIDrawer)<DrawerProps>`
    .MuiPaper-root {
        background: linear-gradient(91.44deg,#0A0812 0.31%,#120F1A 99.41%);
        width: 375px;
        color: ${props => props.theme.textColor};
    }
    .MuiBackdrop-root {
        ${(props): string => blurAndDarkenBackground(props.browsername)};
    }
`;

const BackArrow = styled.div`
    display: flex;
    align-items: center;
    width: fit-content;
    cursor: pointer;
    margin-left: 22px;
    margin-top: 24px;

    span {
        margin-top: 3px;
    }
`;
