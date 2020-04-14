import * as React from 'react';
import styled from '../../../../config/styled';

import CardContainer from '../../elements/card-container';

export interface PhotosVideosCardProps extends React.ComponentProps<any> {
  photos: string[];
  title: string;
  removeBg?: boolean;
  wSeparator?: boolean;
}

const H3 = styled.h3`
  margin-bottom: ${props => props.theme.regularSpacing};
  width: 100%;
`

const PhotosGrid = styled.div`
  display: flex;

  .column {
    flex: 0 0 50%;
    height: 50vh;
    max-height: 200px;
    overflow: hidden;

    &:first-of-type{
      padding-right: calc(${props => props.theme.smallSpacing} / 2);
    }

    &:last-of-type {
      padding-left: calc(${props => props.theme.smallSpacing} / 2);
    }
  }

  .img {
    border-radius: ${props => props.theme.defaultRadius};
    height: 100%;
    object-fit: cover;
    width: 100%;

    &__container  {
      height: 50%;

      &:first-of-type {
        padding-bottom: calc(${props => props.theme.smallSpacing} / 2);
      }

      &:last-of-type {
        padding-top: calc(${props => props.theme.smallSpacing} / 2);
      }
    }
  }

`

export const PhotosVideosCard: React.FunctionComponent<PhotosVideosCardProps> = (props: PhotosVideosCardProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg}>
            <H3>{props.title}</H3>
            <PhotosGrid>
              <div className="column">
                <img src={props.photos[1]} className="img" />
              </div>
              <div className="column">
                <div className="img__container">
                  <img src={props.photos[0]} className="img"/>
                </div>
                <div className="img__container">
                  <img src={props.photos[2]} className="img"/>
                </div>
              </div>
            </PhotosGrid>
        </CardContainer>
};

export default PhotosVideosCard;
