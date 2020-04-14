import * as React from 'react';
import CardContainer from '../../../elements/card-container';
import Separator from '../../../elements/separator';
import styled from '../../../../../config/styled';

export interface SponsorsProps extends React.ComponentProps<any> {
  overflowSeparator?: boolean;
  sponsors: any[];
  title: string;
  wSeparator?: boolean;
}

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const ImgContainer = styled.div`
  flex: 0 0 50%;
  margin: ${props => props.theme.regularSpacing} 0;
  padding: 0 ${props => props.theme.smallSpacing};
  text-align: center;
`

const Title = styled.h4`
  color: ${props => props.theme.textColorDarker};
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: ${props => props.theme.smallSpacing};
  text-align: center;
  text-transform: uppercase;
  width: 100%;
`

export const Sponsors: React.FunctionComponent<SponsorsProps> = (props:SponsorsProps): JSX.Element => {

  return <CardContainer>
           <Title>{props.title}</Title>
           <Grid>
            {props.sponsors.map((sponsor) =>
              <ImgContainer key={sponsor.id}>
                <img src={sponsor.logo} />
              </ImgContainer>
            )}
           </Grid>
            {props.wSeparator &&
              <Separator />
            }
        </CardContainer>
};

export default Sponsors;
