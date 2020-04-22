import * as React from 'react';
import SingleImage, { SingleImageProps } from '../single-image';
import Flicking from "@egjs/react-flicking";
import styled from '../../../config/styled';

export interface FeaturedCarouselProps extends React.ComponentProps<any> {
  slides: SingleImageProps[];
}

const CarouselContainer = styled.section`
  padding: ${props => props.theme.biggerSpacing} 0 ${props => props.theme.biggerSpacing}  ${props => props.theme.biggerSpacing};
  z-index: 1;
`
const Slide = styled(SingleImage)`
  width: 90%;
`

export const FeaturedCarousel: React.FunctionComponent<FeaturedCarouselProps> = (props: FeaturedCarouselProps): JSX.Element => {

  return  <CarouselContainer>
            <Flicking
              anchor={0}
              collectStatistics = {false}
              gap={16}
              hanger={0}
            >
              {props.slides.map((slide: SingleImageProps) => {
                return <Slide
                          key={slide.id}
                          id={slide.id}
                          src={slide.src}
                          title={slide.title}
                          price={slide.price}
                          text={slide.text}
                          mainColor={slide.mainColor}
                      />
              })}

            </Flicking>
          </CarouselContainer>

};

export default FeaturedCarousel;
