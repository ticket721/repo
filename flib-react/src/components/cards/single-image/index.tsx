import * as React from 'react';
import styled from '../../../../config/styled';

export interface SingleImageProps extends React.ComponentProps<any> {
  src: string;
}

const Container = styled.div`
  border-radius: ${props => props.theme.biggerSpacing};
  height: 50vw;
  overflow: hidden;
  width: 100%;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`

export const SingleImage: React.FunctionComponent<SingleImageProps> = (props: SingleImageProps): JSX.Element => {
  return <Container>
          <img src={props.src} />
        </Container>
};

export default SingleImage;
