import * as React      from 'react';
import styled          from '../../../config/styled';
import { OnlineBadge } from '../../events/single-image/OnlineTag';
import { motion }      from 'framer-motion';

export interface SearchResultsProps extends React.ComponentProps<any> {
  noResultsLabel: string;
  searchResults: SearchCategory[];
}

interface SearchCategory {
  id: string | number;
  name: string;
  url: string;
  viewResultsLabel?: string;
  onViewResults?: () => void;
  results: JSX.Element[];
}

interface Event {
  color: string;
  name: string;
  id: string | number;
  price: string;
  date: string;
  image: string;
  onClick?: () => void;
}

const Container = styled.div<SearchResultsProps>`
    width: 100%;
`;

const ImgContainer = styled.div<{ src: string }>`
    border-radius: ${(props) => props.theme.defaultRadius};
    padding-top: 80px;
    margin-right: ${(props) => props.theme.regularSpacing};
    width: 80px;
    overflow: hidden;
    position: relative;
    background-image: url(${(props) => props.src});
    background-size: cover;
    background-position: center;
`;

const SingleResult = styled(motion.article)<React.ComponentProps<any>>`
    align-items: center;
    display: flex;
    font-size: 13px;
    margin-bottom: ${(props) => props.theme.regularSpacing};
    width: 100%;
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

    &:last-of-type {
        margin-bottom: ${(props) => props.customMarginBottom || props.theme.biggerSpacing};
    }

    & > div:last-child > span {
        color: ${(props) => props.theme.textColorDark};
        display: block;
        margin-top: 12px;

        &:first-of-type {
            margin-top: ${(props) => props.theme.smallSpacing};
        }
    }
`;

const CategorySection = styled.section`
    padding: ${(props) => props.theme.biggerSpacing} ${(props) => props.theme.biggerSpacing};

    h2 {
        font-size: 18px;
        margin-bottom: ${(props) => props.theme.regularSpacing};
    }

    a {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: ${(props) => props.theme.defaultRadius};
        color: ${(props) => props.theme.textColor};
        display: block;
        font-size: 15px;
        font-weight: 500;
        padding: ${(props) => props.theme.regularSpacing};
        text-align: center;
    }
`;

const EllipsedTitle = styled.h4`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
`;

const AbsoluteOnlineTagDiv = styled.div`
    position: absolute;
    right: 2px;
    top: 2px;
`;

export const SingleEvent = (props: Event & { customMarginBottom?: string; online?: boolean }) => {
  return (
    <SingleResult clickable={!!props.onClick} onClick={props.onClick} customMarginBottom={props.customMarginBottom} whileTap={{scale: 0.95}}>
      <ImgContainer src={props.image}>
        {props.online ? (
          <AbsoluteOnlineTagDiv>
            <OnlineBadge/>
          </AbsoluteOnlineTagDiv>
        ) : null}
      </ImgContainer>
      <div>
        <EllipsedTitle>{props.name}</EllipsedTitle>
        <span>{props.date}</span>
        <span style={{ color: props.color }}>{props.price}</span>
      </div>
    </SingleResult>
  );
};

export const CategoryResult = (props: any) => {
  return (
    <CategorySection>
      <h2>{props.category.name}</h2>
      {props.category.results}
      {props.category.viewResultsLabel ? (
        <a onClick={props.category.onViewResults}>{props.category.viewResultsLabel}</a>
      ) : null}
    </CategorySection>
  );
};

export const SearchResults: React.FunctionComponent<SearchResultsProps & { className?: string }> = (
  props: SearchResultsProps,
): JSX.Element => {
  return (
    <Container className={props.className}>
      {props.searchResults.length ? (
        props.searchResults.map((category: SearchCategory) => {
          return <CategoryResult key={category.id} category={category}/>;
        })
      ) : (
        <CategorySection>
          <h2>{props.noResultsLabel}</h2>
        </CategorySection>
      )}
    </Container>
  );
};

SearchResults.defaultProps = {
  mainColor: '#079CF0',
};

export default SearchResults;
