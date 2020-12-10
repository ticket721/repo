import React                          from 'react';
import { Icon, Navbar as FlibNavbar } from '@frontend/flib-react/lib/components';
import { Link, useLocation }          from 'react-router-dom';
import { isNavItemActive }                from '@frontend/core/lib/utils/isNavItemActive';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/hooks/useHaptics';

interface NavbarProps {
    visible: boolean;
}

export const Navbar: React.FC<NavbarProps> = (props: NavbarProps): JSX.Element => {

    const location = useLocation();
    const haptics = useHaptics();

    return <FlibNavbar iconHeight={'22px'} visible={props.visible}>
        <Link replace={true} to={'/'} className={isNavItemActive('/', location)}
              onClick={() => {
                  haptics.impact({
                      style: HapticsImpactStyle.Medium
                  })
              }}
        >
            <Icon icon={'home'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/search'} className={isNavItemActive('/search', location)}
              onClick={() => {
                  haptics.impact({
                      style: HapticsImpactStyle.Medium
                  })
              }}
        >
            <Icon icon={'search'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/wallet'} className={isNavItemActive('/wallet', location)}
              onClick={() => {
                  haptics.impact({
                      style: HapticsImpactStyle.Medium
                  })
              }}
        >
            <Icon icon={'t721'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/tags'} className={isNavItemActive('/tags', location)}
              onClick={() => {
                  haptics.impact({
                      style: HapticsImpactStyle.Medium
                  })
              }}
        >
            <Icon icon={'like'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/profile'} className={isNavItemActive('/profile', location)}
              onClick={() => {
                  haptics.impact({
                      style: HapticsImpactStyle.Medium
                  })
              }}
        >
            <Icon icon={'profile'} color='#FFFFFF' size={'22px'}/>
        </Link>

    </FlibNavbar>
};
