import * as React from 'react';
import styled from '../../../../config/styled';
import Select from '../../inputs/select';

export interface TicketQtyProps extends React.ComponentProps<any> {
  color?: string;
  gradient?: string[];
  description: string;
  feesIncluded?: boolean;
  selected?:boolean;
  price: string;
  title: string;
  ticketsLeft: number;
}

const Container = styled.article<TicketQtyProps>`
  background-color: ${props => props.selected ? props.theme.darkerBg : props.theme.darkBg};
  border-bottom: 2px solid #000;
  font-weight: 500;
  padding: ${props => props.theme.biggerSpacing};
  position: relative;
  transition: background-color 300ms ease;

  &:last-of-type{
    border: none;
  }

  &:before {
    background: linear-gradient(260deg, ${props => props.gradient?.join(', ')});
    content: "";
    display: block;
    height: 100%;
    left: 0;
    opacity: ${props => props.selected ? 1 : 0};
    position: absolute;
    top: 0;
    transition: opacity 300ms ease;
    width: 2px;
  }

  h4 {
    font-size: 15px;
    margin: ${props => props.theme.regularSpacing} 0 ${props => props.theme.smallSpacing};

    & + span {
      color: ${props => props.theme.textColorDarker};
    }
  }

  p {
    color: ${props => props.theme.textColorDark};
    margin-top: ${props => props.theme.regularSpacing};
  }
`

export const TicketQty: React.FunctionComponent<TicketQtyProps> = (props: TicketQtyProps): JSX.Element => {
  const options = [{
    "value": "1",
    "label": "1"
  },{
    "value": "2",
    "label": "2"
  },{
    "value": "3",
    "label": "3"
  }]

  return <Container selected={props.selected} gradient={props.gradient}>
            <div className="row aic jcsb">
              <h3>{props.title}</h3>
              <Select
                defaultValue={options[0]}
                options={options}
                menu
                searchable={false}
              />
            </div>
            <h4>{props.price} /each</h4>
            <span>{props.feesIncluded ? 'Fees included' : '+ fees'}</span>
            <p>{props.description}</p>
          </Container>
};

TicketQty.defaultProps = {
  color: '#079CF0',
  gradient: ['#079CF0','#2143AB']
}

export default TicketQty;
