import * as React from 'react';
import styled from '../../../config/styled';
import CardContainer from '../../elements/card-container';

interface Item {
  name: string;
  price: number;
}

export interface PurchaseTotalProps extends React.ComponentProps<any> {
  totalLabel: string;
  subtotalLabel: string;
  label: string;
  total: Item[];
  fees: Item[];
}


const Title = styled.h4`
    color: ${(props) => props.theme.textColorDarker};
    margin-bottom: ${(props) => props.theme.regularSpacing};
    width: 100%;

    & + h2 {
        margin-bottom: ${(props) => props.theme.biggerSpacing};
    }
`;

const Row = styled.div`
    align-items: center;
    color: ${(props) => props.theme.textColorDark};
    font-size: 13px;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${(props) => props.theme.smallSpacing};
    width: 100%;

    &.highlight {
        color: ${(props) => props.theme.textColor};
    }
`;

const Separator = styled.span`
    background-color: ${(props) => props.theme.componentColorLighter};
    content: '';
    display: block;
    height: 2px;
    margin: ${(props) => props.theme.smallSpacing} 0 ${(props) => props.theme.regularSpacing} -24px;
    width: calc(100% + 24px);
`;

export const PurchaseTotal: React.FunctionComponent<PurchaseTotalProps> = (props: PurchaseTotalProps): JSX.Element => {
  return (
    <CardContainer>
      <Title className={'uppercase'}>{props.label}</Title>
      <h2>{
        [
          ...props.total,
          ...props.fees
        ]
          .map(a => a.price)
          .reduce((a, b): number => a + b)
          .toFixed(2)
      }€</h2>
      {props.total?.map((item: Item, idx: number) => {
        return (
          <Row key={`${idx}`}>
                        <span>
                            {item.name}
                        </span>
            <div>{item.price.toFixed(2)}€</div>
          </Row>
        );
      })}
      <Separator />
      <Row>
        <span>{props.subtotalLabel}</span>
        <span>{
          props.total
            .map(a => a.price)
            .reduce((a, b): number => a + b)
            .toFixed(2)
        }€</span>
      </Row>
      {props.fees?.map((item: Item, idx: number) => {
        return (
          <Row key={`${idx}`}>
                        <span>
                            {item.name}
                        </span>
            <div>{item.price.toFixed(2)}€</div>
          </Row>
        );
      })}
      <Separator />
      <Row>
        <span>{props.totalLabel}</span>
        <span>{
          [
            ...props.total,
            ...props.fees
          ]
            .map(a => a.price)
            .reduce((a, b): number => a + b)
            .toFixed(2)
        }€</span>
      </Row>
    </CardContainer>
  );
};

// {props.fees && (
//   <CollapsedContainer showFees={showFees}>
//     <Row>
//                         <span
//                           className={'row'}
//                           onClick={() => {
//                             setShowFees(!showFees);
//                           }}
//                         >
//                             Fees
//                             <Icon icon={'chevron'} size={'10px'} color={'rgba( 255, 255, 255, 0.6)'} />
//                         </span>
//       <span>{feesTotal()}€</span>
//     </Row>
//     <Collapsed showFees={showFees}>
//       {props.fees.map((fee: Fee, idx: number) => {
//         return (
//           <Row key={`${fee.id}${idx}`}>
//             <span>{fee.name}</span>
//             <span>{fee.price.toFixed(2)}</span>
//           </Row>
//         );
//       })}
//     </Collapsed>
//   </CollapsedContainer>
// )}
// <Row>
//   <span>Taxes</span>
//   <span>{props.taxes.toFixed(2)}€</span>
// </Row>
// <Separator />
// <Row className={'highlight'}>
//   <span>Total</span>
//   <span>{props.total.toFixed(2)}€</span>
// </Row>

export default PurchaseTotal;
