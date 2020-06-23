import * as React from 'react';
import styled from '../../../config/styled';

export interface SingleImageProps extends React.ComponentProps<any> {
    price?: string | number;
    id: string | number;
    src: string;
    text?: string;
    title?: string;
    mainColor?: string;
    smaller?: boolean;
    imgOnly?: boolean;
    begin?: Date;
    end?: Date;
    dateLabel?: string;
}

const Container = styled.div<SingleImageProps>`
    border-radius: ${(props) => props.theme.defaultRadius};
    height: ${(props) => (props.smaller ? '165px' : '200px')};
    margin-bottom: ${(props) => props.theme.regularSpacing};
    overflow: hidden;
    position: relative;
    width: 100%;

    img {
        height: 100%;
        object-fit: cover;
        width: 100%;
    }

    ${(props) =>
        !props.imgOnly &&
        `
    &::after {
      background: linear-gradient(180deg, rgba(10, 8, 18, 0), rgba(10, 8, 18, 0.85));
      content: '';
      display: block;
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 0;
    }
  `}
`;

const Details = styled.div<SingleImageProps>`
    bottom: ${(props) => props.theme.regularSpacing};
    color: ${(props) => props.theme.textColorDark};
    font-size: 13px;
    font-weight: 500;
    left: ${(props) => props.theme.regularSpacing};
    position: absolute;
    z-index: 1;
    width: calc(100% - 2 * ${(props) => props.theme.regularSpacing});

    h3 {
        color: ${(props) => props.theme.textColor};
        font-size: ${(props) => (props.smaller ? '12px' : '14px')};
        text-transform: uppercase;
    }

    span {
        align-items: center;
        color: ${(props) => props.mainColor};
        display: inline-flex;

        &::after {
            background-color: ${(props) => props.theme.textColorDark};
            border-radius: 100%;
            content: '';
            display: inline-block;
            height: 4px;
            margin: 0 6px;
            position: relative;
            top: -1px;
            width: 4px;
        }
    }
`;

const EllipsedText = styled.p`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100%);
`;

const EllipsedTitle = styled.h3`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: calc(100%);
`;

export const SingleImage: React.FunctionComponent<SingleImageProps & { className?: string }> = (
    props: SingleImageProps,
): JSX.Element => {
    return (
        <Container imgOnly={props.imgOnly} smaller={props.smaller} className={props.className}>
            <img src={props.src} />
            {!props.imgOnly && (
                <Details mainColor={props.mainColor} smaller={props.smaller}>
                    <EllipsedTitle>{props.title}</EllipsedTitle>
                    {props.dateLabel ? <EllipsedText>{props.dateLabel}</EllipsedText> : null}
                    <EllipsedText>
                        {props.price && <span>{props.price} €</span>}
                        {props.text}
                    </EllipsedText>
                </Details>
            )}
        </Container>
    );
};

SingleImage.defaultProps = {
    mainColor: '#079CF0',
};

export default SingleImage;
