import * as React from 'react';
import styled from '../../../config/styled';
import CardContainer from '../../elements/card-container';

export interface PhotosVideosCardProps extends React.ComponentProps<any> {
  photos: string[];
  title: string;
  removeBg?: boolean;
  wSeparator?: boolean;
}

const PhotosGrid = styled.div`
  display: flex;
  margin-top: ${props => props.theme.biggerSpacing};
  height: 50vh;
  max-height: 200px;
  width: 100%;

  .column {
    flex: 1 1 0;

    &:nth-of-type(2) {
      padding-left: ${props => props.theme.smallSpacing};
    }
  }

  .img {
    border-radius: ${props => props.theme.defaultRadius};
    height: 100%;
    object-fit: cover;
    width: 100%;

    &__container  {
      flex: 1;
      overflow: auto;

      &:nth-of-type(2) {
        padding-top: ${props => props.theme.smallSpacing} ;
      }
    }
  }
`

export const PhotosVideosCard: React.FunctionComponent<PhotosVideosCardProps> = (props: PhotosVideosCardProps): JSX.Element => {

  return <CardContainer removeBg={props.removeBg}>
            <div className="row aic jcsb">
              <h3>{props.title}</h3>
              <a href="#todo">View all</a>
            </div>
            <PhotosGrid>
              <div className="column">
                <img src={props.photos[0]} className="img" />
              </div>
              {props.photos.length > 1 &&
                <div className="column">
                  {props.photos[1] &&
                    <div className="img__container">
                      <img src={props.photos[1]} className="img"/>
                    </div>
                  }

                  {props.photos[2] &&
                    <div className="img__container">
                      <img src={props.photos[2]} className="img"/>
                    </div>
                  }
                </div>
              }
            </PhotosGrid>
        </CardContainer>
};

export default PhotosVideosCard;
