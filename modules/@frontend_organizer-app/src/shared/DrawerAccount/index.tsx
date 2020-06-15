import React                                                  from 'react';
import styled                                                 from 'styled-components';
import { detect }                                             from 'detect-browser';
import { Drawer as MUIDrawer, DrawerProps as MUIDrawerProps } from '@material-ui/core';
import { blurAndDarkenBackground }                            from '@frontend/core/lib/utils/style';
import { Route, Switch }                                      from 'react-router-dom';
import { drawerRoutes }                                       from './drawerRoutes';
import { useHistory }                                         from 'react-router';
import { WalletHeader }                                       from '@frontend/flib-react/lib/components';
import { ArrowBackIos }                                       from '@material-ui/icons';
import { computeProfilePath }                                 from '@frontend/core/lib/utils/computeProfilePath';

interface Props {
    open: boolean,
    onClose: () => void;
}

const user = {
    firstName: 'Pierre',
    lastName: 'Paul',
    profilePicture: '/favicon.ico',
    creditBalance: 3500,
    creditCard: 5234,
    currentLocation: 'Paris, France',
};

const DrawerAccount = ({open, onClose}: Props): JSX.Element => {
    const history = useHistory();
    const browser = detect();

    const topBar = (path: string) => {
        if (path === '/') {
            return null;
        }

        return <BackArrow onClick={() => history.push(computeProfilePath(history.location.pathname))}>
            <ArrowBackIos />
            <span>Back</span>
        </BackArrow>
    };

    return (
        <Drawer anchor='right' open={open} onClose={onClose} browsername={browser?.name}>
            <WalletHeader user={user} />
            <Switch>
                {
                    drawerRoutes.map((route, idx) => (
                        <Route
                            key={idx}
                            path={computeProfilePath(history.location.pathname, route.path)}>
                            {
                                topBar(route.path)
                            }
                            <route.component />

                        </Route>
                    ))
                }
            </Switch>
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

    span {
        margin-top: 3px;
    }
`;

export default DrawerAccount;
