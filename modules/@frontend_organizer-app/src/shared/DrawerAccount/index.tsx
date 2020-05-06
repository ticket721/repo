import React from 'react';
import styled              from 'styled-components';
import { detect }                                             from 'detect-browser';
import { Drawer as MUIDrawer, DrawerProps as MUIDrawerProps } from '@material-ui/core';
import { blurAndDarkenBackground } from '@frontend/core/lib/utils/style';
import { Route, Switch } from 'react-router-dom';
import { computeDrawerPath, drawerRoutes } from './drawerRoutes';
import { useLocation }                     from 'react-router';

interface Props {
  open: boolean,
  onClose: () => void;
}

const DrawerAccount = ({open, onClose}: Props): JSX.Element => {
  const location = useLocation();
    const browser = detect();

    return (
        <Drawer anchor='right' open={open} onClose={onClose} browsername={browser?.name}>
            <Switch>
                {
                    drawerRoutes.map((route, idx) => (
                        <Route
                        key={idx}
                        path={computeDrawerPath(location.pathname, route.path)}>
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

export default DrawerAccount;
