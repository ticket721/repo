import * as React from 'react';
import SingleImage, { SingleImageProps } from '../single-image';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import styled from '../../../config/styled';
import slugify from 'slugify';

export interface FeaturedCarouselProps extends React.ComponentProps<any> {
  slides: SingleImageProps[];
}

const SlideItem = (props: any) => {
  return  <SingleImage
            key={slugify(props.slide.title)}
            src={props.slide.src}
            title={props.slide.title}
            price={props.slide.price}
            text={props.slide.text}
            mainColor={props.slide.mainColor}
          />
}

const CarouselContainer = styled.section`
  padding: ${props => props.theme.biggerSpacing} 0 ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
  position: relative;
  z-index: 1;

  .alice-carousel {
    left: -16px;
    position: relative;

    &__stage-item {
      margin: 0 16px 0 0;
    }
  }
`

export const FeaturedCarousel: React.FunctionComponent<FeaturedCarouselProps> = (props: FeaturedCarouselProps): JSX.Element => {

  const stagePadding = {
    paddingLeft: 0,
    paddingRight: 48
  }

  return  <CarouselContainer>
            <AliceCarousel
              buttonsDisabled={true}
              dotsDisabled={true}
              infinite={false}
              mouseTrackingEnabled={true}
              stagePadding={stagePadding}
              items={props.slides.map((slide: SingleImageProps) => {
                return <SlideItem slide={slide} />
              })}
            />
          </CarouselContainer>

};

export default FeaturedCarousel;
