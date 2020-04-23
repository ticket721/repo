import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface SearchResultsProps extends React.ComponentProps<any> {
  mainColor?: string;
  noResultsLabel: string;
  viewResultsLabel: string;
  searchResults: SearchCategory[];
}

interface SearchCategory {
  id: string | number;
  name: string;
  url: string;
  results: EventOrLocation[];
}

interface Event {
  name: string;
  id: string | number;
  price: number;
  date: string;
  image: string;
}

interface Location {
  id: string | number;
  name: string;
  numberEvents: number;
  url: string;
}

type EventOrLocation = Event | Location;

const Container = styled.div<SearchResultsProps>`
  width: 100%;

  .price {
    color: ${props => props.color};
  }
`

const ImgContainer = styled.div`
  border-radius: ${props => props.theme.defaultRadius};
  height: 80px;
  margin-right: ${props => props.theme.regularSpacing};
  overflow: hidden;
  width: 80px;

  &.icon {
    align-items: center;
    background-color: ${props => props.theme.componentColorLight};
    height: 56px;
    display: flex;
    justify-content: center;
    width: 56px;

    svg {
      height: 24px;
    }
  }

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`

const SingleResult = styled.article<SearchResultsProps>`
  align-items: center;
  display: flex;
  font-size: 13px;
  margin-bottom: ${props => props.theme.regularSpacing};

  &:last-of-type {
    margin-bottom: ${props => props.theme.biggerSpacing};
  }

  span {
    color: ${props => props.theme.textColorDark};
    display: block;
    margin-top: ${props => props.theme.smallSpacing};

    &:first-of-type {
      margin-top: 4px;
    }
  }
`

const CategorySection = styled.section`
  padding: ${props => props.theme.regularSpacing} ${props => props.theme.biggerSpacing};

  h2 {
    margin-bottom: ${props => props.theme.regularSpacing};
  }

  a {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: ${props => props.theme.defaultRadius};
    color: ${props => props.theme.textColor};
    display: block;
    font-size: 15px;
    font-weight: 500;
    padding: ${props => props.theme.regularSpacing};
    text-align: center;
  }
`

const isLocationOrEvent = (el : EventOrLocation): el is Event => {
  if((el as Event).price) {
    return true;
  }

  return false;
}

const SingleEvent = (props: any) => {

  return <SingleResult>
          <ImgContainer>
            <img src={props.event.image} />
          </ImgContainer>
          <div>
            <h4 className="uppercase">{props.event.name}</h4>
            <span>{props.event.date}</span>
            <span className="price">{props.event.price}€</span>
          </div>
        </SingleResult>
}

const SingleLocation = (props: any) => {
  return  <SingleResult>
            <ImgContainer className="icon">
              <Icon icon="pin" height="16" width="12" fill="rgba(255, 255, 255, 0.6)"/>
            </ImgContainer>
            <div>
              <h4>{props.location.name}</h4>
              <span>{props.location.numberEvents} events</span>
            </div>
          </SingleResult>
}

const CategoryResults = (props: any) => {
  return <CategorySection>
          <h2>{props.category.name}</h2>
          {props.category.results.map((result: EventOrLocation) => {
            if(isLocationOrEvent(result)) {
              return <SingleEvent key={result.id} event={result} color={props.color} />
            }

            return <SingleLocation key={result.id} location={result} />
          })}
          {/* update to use react-router Link */}
          <a href={props.category.url}>{props.resultsLabel}</a>
        </CategorySection>
}

export const SearchResults: React.FunctionComponent<SearchResultsProps & {className?: string}> = (props: SearchResultsProps): JSX.Element => {
  return <Container className={props.className} color={props.mainColor}>
          {props.searchResults.length ? (
            props.searchResults.map((category: SearchCategory) => {
              return <CategoryResults key={category.id} category={category} resultsLabel={props.viewResultsLabel}/>
            })
          ) : (
            <CategorySection>
              <h2>{props.noResultsLabel}</h2>
            </CategorySection>
          )}
        </Container>
};

SearchResults.defaultProps = {
  mainColor: '#079CF0'
}

export default SearchResults;
