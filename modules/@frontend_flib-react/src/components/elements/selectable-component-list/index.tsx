import * as React            from 'react';
import styled                from '../../../config/styled';
import { TicketSingleProps } from '../../ticket/single';

const Container = styled.article<TicketSingleProps>`
    background-color: ${(props) => (props.selected ? props.theme.darkerBg : props.theme.darkBg)};
    font-weight: 500;
    padding: 10px;
    position: relative;
    transition: background-color 300ms ease;

    &:last-of-type {
        border: none;
    }

    &:before {
        background: linear-gradient(260deg, ${(props) => props.gradient?.join(', ')});
        content: '';
        display: block;
        height: 100%;
        left: 0;
        opacity: ${(props) => (props.selected ? 1 : 0)};
        position: absolute;
        top: 0;
        transition: opacity 300ms ease;
        width: 2px;
    }
`;

export interface SelectableComponentListElementProps extends React.ComponentProps<any> {
  color?: string;
  gradient?: string[];
  selected?: boolean;
  onSelection: () => void;
  style?: any;
}

export const SelectableComponentListElement: React.FunctionComponent<SelectableComponentListElementProps> =
  (props: SelectableComponentListElementProps): JSX.Element => {
    return (
      <Container
        style={props.style}
        selected={props.selected}
        resale={props.resale}
        gradient={props.gradient}
        onClick={props.onSelection}
      >
        {
          props.children
        }
      </Container>
    );
  };

export interface SelectableComponentListProps extends React.ComponentProps<any> {
  color?: string;
  gradient?: string[];
  elements: any[];
  render: (element: any, idx: number) => JSX.Element;
}

export default SelectableComponentListElement;

SelectableComponentListElement.defaultProps = {
  color: '#079CF0',
  gradient: ['#079CF0', '#2143AB'],
};
