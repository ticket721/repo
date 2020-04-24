import * as React from 'react';
import styled from '../../../config/styled';
import slugify from 'slugify';
import Icon from '../../icon';

export interface SearchTermsProps extends React.ComponentProps<any> {
  title:string;
  clearLabel: string;
  clearAll: () => void;
  noTerms: string;
  terms: string[];
}

const ClearButton = styled.button`
  color: ${props => props.theme.textColorDark};
  font-size: 14px;
  font-weight: 500;
`

const TermList = styled.ul`
  font-size: 14px;
  font-weight: 500;
  margin: ${props => props.theme.smallSpacing} 0 ${props => props.theme.biggerSpacing};

  svg {
    margin-right: 12px;
  }
`

const Container = styled.section`
  padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};
`

const Term = styled.li`
  align-items: center;
  display: flex;
  margin: ${props => props.theme.regularSpacing} 0;
  width: 100%;
`

export const SearchTerms: React.FunctionComponent<SearchTermsProps> = (props: SearchTermsProps): JSX.Element => {
  return <Container>
          <div className="row aic jcsb">
            <h3>{props.title}</h3>
            {props.terms.length > 0 &&
              <ClearButton onClick={props.clearAll}>{props.clearLabel}</ClearButton>
            }
          </div>

            <TermList>
              {props.terms.length ? (
                props.terms.map((term: string) => {
                  return <Term key={slugify(term)}><Icon icon="search" height="24" width="24" fill="rgba(255, 255, 255, 0.38)" />{term}</Term>
                })
              ) : (
                <Term><Icon icon="search" height="24" width="24" fill="rgba(255, 255, 255, 0.38)" />{props.noTerms}</Term>
              )}
            </TermList>
        </Container>
}

export default SearchTerms;
