import * as React from 'react';
import styled from '../../../config/styled';
import { OnlineTag } from './OnlineTag';

export interface SingleImageProps extends React.ComponentProps<any> {
    price?: string | number;
    id: string | number;
    cover: string;
    text?: string;
    title?: string;
    mainColor?: string;
    smaller?: boolean;
    imgOnly?: boolean;
    begin?: Date;
    online?: boolean;
    online_text?: string;
    end?: Date;
    dateLabel?: string;
    onClick?: () => void;
}

const Container = styled.div<SingleImageProps>`
    position: relative;
    border-radius: ${(props) => props.theme.defaultRadius};
    width: 100%;
    overflow: hidden;
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
    background-image: url(${(props) => props.cover});
    background-size: cover;
    background-position: center;
    padding-top: 56.25%;
`;

const Filter = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    border-radius: ${props => props.theme.defaultRadius};
    width: 110%;
    height: 110%;
    background: linear-gradient(0deg, rgba(0,0,0,0.6) 15%, transparent);
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

const AbsoluteOnlineTagDiv = styled.div`
    position: absolute;
    right: ${(props) => props.theme.regularSpacing};
    top: ${(props) => props.theme.regularSpacing};
`;

export const SingleImage: React.FunctionComponent<SingleImageProps & { className?: string }> = (
    props: SingleImageProps,
): JSX.Element => {
    return (
        <Container
            cover={props.cover}
            imgOnly={props.imgOnly}
            smaller={props.smaller}
            className={props.className}
            clickable={!!props.onClick}
            onClick={props.onClick}
        >
            <Filter />
            {props.online && props.online_text ? (
                <AbsoluteOnlineTagDiv>
                    <OnlineTag online={props.online_text} />
                </AbsoluteOnlineTagDiv>
            ) : null}
            {!props.imgOnly && (
                <Details mainColor={props.mainColor} smaller={props.smaller}>
                    <EllipsedTitle>{props.title}</EllipsedTitle>
                    {props.dateLabel ? <EllipsedText>{props.dateLabel}</EllipsedText> : null}
                    <EllipsedText>
                        <span>{props.price}</span>
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
