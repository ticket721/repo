import * as React from 'react';
import styled     from '../../../config/styled';

export interface ActivitiesContainerProps extends React.ComponentProps<any> {
  title: string;
  viewAllLabel?: string;
  viewAllAction?: () => void;
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

const Button = styled.button`
  font-weight: 500;
  font-size: 14px;
  outline: none;
  text-align: right;
  color: ${props => props.theme.textColorDark};
`;

export const ActivitiesContainer: React.FunctionComponent<ActivitiesContainerProps> = (props: ActivitiesContainerProps): JSX.Element => {

  return  <Section>
            <div className='row aic jcsb'>
                <h2>{props.title}</h2>
                {/* TODO -- Update to use link from react-router */}
                {
                    props.viewAllAction ?
                      <Button onClick={props.viewAllAction} type='button'>{props.viewAllLabel}</Button> :
                      null
                }
            </div>
            {props.children}
          </Section>
};

export default ActivitiesContainer;
