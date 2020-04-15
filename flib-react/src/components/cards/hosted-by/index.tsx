import * as React from 'react';
import CardContainer from '../../elements/card-container';
import styled from '../../../../config/styled';
import LinkButton from '../../elements/link-button';
import Icon from '../../icon';

export interface HostedByProps extends React.ComponentProps<any> {
  title: string;
  hostedBy: HostProps;
  removeBg?: boolean;
}

interface HostProps {
  name: string;
  image: string;
  eventsLink?: string;
  spotifyUrl?: string;
  numberEvents?: number;
}

const Title = styled.h4`
  color: ${props => props.theme.textColorDarker};
  margin-bottom: ${props => props.theme.regularSpacing};
`;

const ImgContainer = styled.div`
  border-radius: ${props => props.theme.defaultRadius};
  height: 48px;
  overflow: hidden;
  margin-right: ${props => props.theme.regularSpacing};
  width: 48px;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`

const Infos = styled.div`
  display: flex;
  width: 100%;

  span {
    color: ${props => props.theme.textColorDark};
    display: block;
    margin-top: ${props => props.theme.smallSpacing};
  }
  + * {
    margin-top: ${props => props.theme.biggerSpacing};
  }
`

export const HostedBy: React.FunctionComponent<HostedByProps> = (props:HostedByProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg}>
          <Title className="uppercase">{props.title}</Title>
          <Infos className="aic">
            <div className="row aic">
              <ImgContainer>
                <img src={props.hostedBy.image} />
              </ImgContainer>
              <div>
              <h3>{props.hostedBy.name}</h3>
              {props.hostedBy.numberEvents &&
                <span>{props.hostedBy.numberEvents} events</span>
              }
              </div>
            </div>
            {/* UPDATE TO USE router-link */}
            {props.hostedBy.eventsLink &&
              <a href={props.hostedBy.eventsLink}><Icon icon="rightArrow" height="16" width="16" fill="rgba(255, 255, 255, 0.9)" /></a>
            }
          </Infos>

          {props.hostedBy.spotifyUrl &&

            <LinkButton
              image="assets/images/spotify--logo.svg"
              label='Listen on spotify'
              to={props.hostedBy.spotifyUrl}
            />
          }
        </CardContainer>
}

export default HostedBy;


