import React, { useState }          from 'react';
import { Icon, Navbar }             from '@frontend/flib-react/lib/components';
import { NavLink }                  from 'react-router-dom';
import { useSelector }              from 'react-redux';
import { T721AppState }             from '../../redux';
import { v4 }                       from 'uuid';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { ActionsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsSearchResponse.dto';
import styled                       from 'styled-components';

const Badge = styled.div`
  position: absolute;
  border-radius: 50%;
  width: ${props => props.theme.smallSpacing};
  height: ${props => props.theme.smallSpacing};
  background-color: ${props => props.theme.badgeColor.hex};
  top: 0;
  right: -${props => props.theme.smallSpacing};
`;

export const LoginNavbar: React.FC = (): JSX.Element => {
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());

    const cartResponse = useRequest<ActionsSearchResponseDto>({
        method: 'actions.search',
        args: [
            token,
            {
                consumed: {
                    $eq: false,
                },
                name: {
                    $eq: '@cart/creation',
                },
            },
        ],
        refreshRate: 3,
    }, `LoginNavbar@${uuid}`);

    let cartBadge = false;

    if (
        !cartResponse.response.loading &&
        !cartResponse.response.error &&
        cartResponse.response.data.actionsets.length > 0
    ) {
        const ticketSelectionData = JSON.parse(cartResponse.response.data.actionsets[0].actions[0].data);

        cartBadge = ticketSelectionData.tickets?.length > 0;
    }

    return <Navbar>
        <NavLink exact={true} to={'/home'}>
            <Icon icon={'home'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/search'}>
            <Icon icon={'search'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/'}>
            <Icon icon={'t721'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/tags'}>
            <Icon icon={'tags'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/profile'}>
            <>
                <Icon icon={'profile'} color='#FFFFFF' size={'22px'}/>
                {
                    cartBadge

                        ?
                        <Badge/>

                        :
                        null
                }
            </>
        </NavLink>

    </Navbar>
};
