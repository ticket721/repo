import * as React from 'react';
import Flicking from "@egjs/react-flicking";
import styled from '../../../config/styled';

export interface EventCarouselProps extends React.ComponentProps<any> {
  title: string;
  slides: Slide[];
}

interface Slide {
  id: number | string;
  name: string;
  date: string;
  url: string;
}

const SlideContainer = styled.article`
  width: 150px;
`
const ImgContainer = styled.div`
  border-radius: ${props => props.theme.defaultRadius};
  height: 150px;
  margin: auto;
  overflow: hidden;
  width: 100%;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`

const Infos = styled.div`
  font-size: 13px;
  padding: 0 8px;

  h4 {
    margin: ${props => props.theme.regularSpacing} 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: ${props => props.theme.textColorDark};
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const SlideItem = (props: any) => {
  return <SlideContainer>
      <ImgContainer>
        <img src={props.slide.url} draggable="false"/>
      </ImgContainer>
      <Infos>
        <h4 className="uppercase">{props.slide.name}</h4>
        <span>{props.slide.date}</span>
      </Infos>
    </SlideContainer>
}

const CarouselContainer = styled.section`
  padding: ${props => props.theme.biggerSpacing} 0 ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
  position: relative;
  z-index: 1;
  h2 {
    margin-bottom: ${props => props.theme.regularSpacing};
  }
`

export const EventCarousel: React.FunctionComponent<EventCarouselProps> = (props: EventCarouselProps): JSX.Element => {
  return  <CarouselContainer>
            <h2>{props.title}</h2>
            <Flicking
              anchor={0}
              collectStatistics={false}
              hanger={0}
              gap={16}
            >
            {props.slides.map((slide: Slide) => {
                return <SlideItem key={slide.id} slide={slide} />
              })}
            </Flicking>
          </CarouselContainer>
};

export default EventCarousel;
