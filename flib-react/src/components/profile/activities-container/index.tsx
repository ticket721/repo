import * as React from 'react';
import styled from '../../../config/styled';

export interface ActivitiesContainerProps extends React.ComponentProps<any> {
  title: string;
  to: string;
  viewAllLabel: string;
}

const Section = styled.section`
  padding: ${props => props.theme.biggerSpacing};

  .row {
    margin-bottom: ${props => props.theme.regularSpacing};
  }

  & > *:not(.row) {
    border-radius: ${props => props.theme.defaultRadius};
    margin-bottom: ${props => props.theme.smallSpacing};
  }
`

export const ActivitiesContainer: React.FunctionComponent<ActivitiesContainerProps> = (props: ActivitiesContainerProps): JSX.Element => {

  return  <Section>
            <div className="row aic jcsb">
              <h2>{props.title}</h2>
              {/* TODO -- Update to use link from react-router */}
              <a href={props.to}>{props.viewAllLabel}</a>
            </div>
            {props.children}
          </Section>
};

export default ActivitiesContainer;
