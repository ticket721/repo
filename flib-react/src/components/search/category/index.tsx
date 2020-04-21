import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface SearchCategoryProps extends React.ComponentProps<any> {
  id: string | number;
  src: string;
  text?: string;
  title?:string;
  mainColor?: string;
  gradient?: string[];
}

const Container = styled.div<SearchCategoryProps>`
  border-radius: ${props => props.theme.defaultRadius};
  height: 150px;
  margin: auto;
  overflow: hidden;
  position: relative;
  width: 100%;

  &::before {
    background: linear-gradient(260.65deg, ${props => props.gradient?.join(', ')});
    content: "";
    display: block;
    height: 100%;
    left: 0;
    opacity: 0.9;
    position: absolute;
    top: 0;
    width: 100%;
  }

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`

const Details = styled.div<SearchCategoryProps>`
  bottom: ${props => props.theme.regularSpacing};
  font-size: 13px;
  font-weight: 500;
  left: ${props => props.theme.regularSpacing};
  position: absolute;
  z-index: 1;

  p {
    align-items: center;
    color: ${props => props.theme.textColorDark};
  }
`

const CategoryIcon = styled(Icon)`
  height: 24px;
  left: ${props => props.theme.regularSpacing};
  position: absolute;
  top: ${props => props.theme.regularSpacing};
`

export const SearchCategory: React.FunctionComponent<SearchCategoryProps & {className?: string}> = (props: SearchCategoryProps): JSX.Element => {
  return <Container className={props.className} gradient={props.gradient}>
          <CategoryIcon icon="tag" height="24" width="24" fill="rgba(255, 255, 255, 0.25)" />
          <img src={props.src} />
          {!props.imgOnly &&
            <Details mainColor={props.mainColor} smaller={props.smaller}>
              <h3>{props.title}</h3>
              <p>{props.text}</p>
            </Details>
          }
        </Container>
};

SearchCategory.defaultProps = {
  mainColor: '#079CF0'
}

export default SearchCategory;
