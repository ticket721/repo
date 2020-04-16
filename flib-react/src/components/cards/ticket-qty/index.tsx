import * as React from 'react';
import CardContainer from '../../elements/card-container';
import styled from '../../../../config/styled';

export interface TicketQtyCardProps extends React.ComponentProps<any> {
  removeBg?: boolean;
  text: string;
  subtitle?: string;
  title: string;
  link?: string;
}

const H3 = styled.h3`
  margin-bottom: ${props => props.theme.smallSpacing};
  width: 100%;
`

export const DescriptonLink: React.FunctionComponent<TicketQtyCardProps> = (props: TicketQtyCardProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg}>
            <div className="row aic jcsb">
            <H3>o</H3>
          </div>
        </CardContainer>
};

export default DescriptonLink;
