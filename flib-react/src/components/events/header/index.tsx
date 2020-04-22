import * as React from 'react';
import styled from '../../../config/styled';
import EventInterface from '../../../shared/eventInterface';
import Border from '../../elements/border';
import Button from '../../button';
import VisibiltySensor from 'react-visibility-sensor';

export interface EventHeaderProps extends React.ComponentProps<any> {
  event: EventInterface;
  onClick: () => void;
  onChange: (e: any) => void;
}

const Header = styled.header<EventHeaderProps>`
  position: relative;

  img {
    height: 40vh;
    object-fit: cover;
    width: 100%;
  }

  h2 {
    text-transform: uppercase;
  }

  h4 {
    color: ${props => props.theme.textColorDark};
    margin: ${props => props.theme.regularSpacing} 0 12px;
  }
`;

const Infos = styled.div`
  background-color: ${props => props.theme.darkerBg};
  border-top-right-radius: ${props => props.theme.bigRadius};
  color: ${props => props.theme.textColor};
  margin-top: -20vh;
  padding: ${props => props.theme.doubleSpacing} ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
  position: relative;
`

export const EventHeader: React.FunctionComponent<EventHeaderProps> = (props: EventHeaderProps): JSX.Element => {

  return <Header>
          <img src={props.event.image} />
          <Infos>
            <h2>{props.event.name}</h2>
            <h4>Ticket from €49 to €100 each</h4>
            <VisibiltySensor onChange={props.onChange}>
              <Button
                type="custom"
                title="Get tickets"
                gradients={props.event.gradients}
                onClick={props.onClick}
              />
            </VisibiltySensor>
          </Infos>
          <Border />
        </Header>
};

export default EventHeader;
