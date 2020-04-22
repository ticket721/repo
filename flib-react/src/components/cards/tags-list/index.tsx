import * as React from 'react';
import CardContainer from '../../elements/card-container';
import styled from '../../../config/styled';

export interface TagsListProps extends React.ComponentProps<any> {
  tags: Tag[];
  handleToggle: () => void;
  label: string;
  removeBg?: boolean;
  showAll?: boolean;
}

interface Tag {
  id: string | number;
  label: string;
}
const Item = styled.span`
  align-items: center;
  background-color: ${props => props.theme.componentColorLight};
  border-radius: ${props => props.theme.defaultRadius};
  display: inline-flex;
  font-size: 13px;
  font-weight: 500;
  justify-content: center;
  padding: 12px ${props => props.theme.regularSpacing};
  text-align: center;
`
const List = styled.div`
  display: grid;
  gap: ${props => props.theme.smallSpacing};
  grid-template-columns: repeat(4, auto);
  margin-top: ${props => props.theme.regularSpacing};
  width: 100%;
`
const ToggleButton = styled(Item)`
  cursor: pointer;
  position: relative;
  z-index: 10;
`;

export const TagsList: React.FunctionComponent<TagsListProps> = (props:TagsListProps): JSX.Element => {
  let maxItems = props.showAll ? props.tags.length : 3;

  return <CardContainer removeBg={props.removeBg}>
      <h3>{props.label}</h3>
      <List>
        {props.tags.slice(0, maxItems).map((tag) => {
          return <Item key={tag.id}>{tag.label}</Item>
        })}
        {props.tags.length > 3 &&
          <ToggleButton key="default" onClick={props.handleToggle}>{props.showAll ? 'Hide' : `${props.tags.length - 3} +`}</ToggleButton>
        }
      </List>
  </CardContainer>
}

export default TagsList;


