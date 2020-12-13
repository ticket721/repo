import React, { useContext } from 'react';
import styled from 'styled-components';
import { detect } from 'detect-browser';
import { useTranslation } from 'react-i18next';
import { Drawer as MUIDrawer, DrawerProps as MUIDrawerProps } from '@material-ui/core';
import { blurAndDarkenBackground } from '../../utils/style';
import { useHistory } from 'react-router';
import { ArrowBackIos } from '@material-ui/icons';
import ProfileRoot from '../Profile/Root';
import Language from '../Profile/Language';
import './locales';
import { UserContext } from '../../contexts/UserContext';
import { ValidateEmail } from '../ValidateEmail';

export type ProfileRoute = 'root' | 'activities' | 'language';

interface DrawerAccountProps {
    payments: boolean;
    route: ProfileRoute;
    onClose: () => void;
    extraButtons?: JSX.Element[];
}

export const DrawerAccount: React.FC<DrawerAccountProps> = ({ route, onClose, payments, extraButtons }: DrawerAccountProps) => {
    const [t] = useTranslation('drawer_account');
    const history = useHistory();
    const browser = detect();
    const user = useContext(UserContext);

    if (!user.valid) {
        return (
            <Drawer anchor='right' open={route !== null} onClose={onClose} browsername={browser?.name}>
                <ValidateEmail forcedMode={'mobile'} />
            </Drawer>
        );
    }

    return (
        <Drawer anchor='right' open={route !== null} onClose={onClose} browsername={browser?.name}>
            {route === 'root' ? <ProfileRoot desktop={true} payments={payments} extraButtons={extraButtons}/> : null}
            {route === 'language' ? (
                <>
                    <BackArrow onClick={() => history.push(history.location.pathname + '?profile=root')}>
                        <ArrowBackIos />
                        <span>{t('back')}</span>
                    </BackArrow>
                    <Language />
                </>
            ) : null}
        </Drawer>
    );
};

interface DrawerProps extends MUIDrawerProps {
    browsername: string | undefined;
}

const Drawer = styled(MUIDrawer)<DrawerProps>`
    .MuiPaper-root {
        background: linear-gradient(91.44deg, #0a0812 0.31%, #120f1a 99.41%);
        width: 375px;
        color: ${(props) => props.theme.textColor};
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
