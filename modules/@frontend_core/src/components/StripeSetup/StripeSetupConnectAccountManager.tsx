import { PasswordlessUserDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
import React                     from 'react';
import styled                    from 'styled-components';

export interface StripeSetupConnectAccountManagerProps {
    user: PasswordlessUserDto;
    stripeInterface: StripeInterfaceEntity;
    forceFetchInterface: () => void;
}

const BalanceContainer = styled.div`
  height: 30vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const MenuContainer = styled.div`
  min-height: 70vh;
  background-color: ${props => props.theme.componentColor};
`;

// const fakeBalance = {
//     "object": "balance",
//     "available": [
//         {
//             "amount": 100,
//             "currency": "eur",
//             "source_types": {
//                 "card": 100
//             }
//         },
//         {
//             "amount": 20,
//             "currency": "usd",
//             "source_types": {
//                 "card": 20
//             }
//         }
//     ],
//     "livemode": false,
//     "pending": [
//         {
//             "amount": 200,
//             "currency": "eur",
//             "source_types": {
//                 "card": 200
//             }
//         },
//         {
//             "amount": 30,
//             "currency": "usd",
//             "source_types": {
//                 "card": 30
//             }
//         }
//     ]
// }

export const StripeSetupConnectAccountManager: React.FC<StripeSetupConnectAccountManagerProps> = (props: StripeSetupConnectAccountManagerProps): JSX.Element => {
    return <>
        <BalanceContainer>
            <>
                <p>price</p>
            </>
        </BalanceContainer>
        <MenuContainer>
            <p>Menu</p>
        </MenuContainer>
    </>
};

