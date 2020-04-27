import * as React from 'react';
import styled from '../../../config/styled';

export interface LinksContainerProps extends React.ComponentProps<any> {
  title: string;
}

const Container = styled.div`
  border-bottom-right-radius: ${props => props.theme.bigRadius};
  border-top-left-radius: ${props => props.theme.bigRadius};
  margin-top: ${props => props.theme.regularSpacing};
  overflow: hidden;
`

const Section = styled.section`
  padding: ${props => props.theme.biggerSpacing} 0;

  h2 {
    padding-left: ${props => props.theme.biggerSpacing};
  }
`

export const LinksContainer: React.FunctionComponent<LinksContainerProps> = (props: LinksContainerProps): JSX.Element => {
  // TODO -- Update to use link from react-router
  return  <Section>
            <h2>{props.title}</h2>
            <Container>
              {props.children}
            </Container>
          </Section>
};

export default LinksContainer;
