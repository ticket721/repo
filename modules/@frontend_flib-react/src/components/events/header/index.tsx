import * as React from 'react';
import styled from '../../../config/styled';
import Button from '../../button';
import VisibiltySensor from 'react-visibility-sensor';
import { OnlineTag } from '../single-image/OnlineTag';

export interface EventHeaderProps extends React.ComponentProps<any> {
    preName: string;
    name: string;
    prices: string;
    cover: string;
    colors: string[];
    online: string;
    buttonTitle: string;
    onClick: () => void;
    onChange: (e: any) => void;
}

const Header = styled.header<EventHeaderProps>`
    position: relative;

    border-bottom: 2px solid #120f1a;

    img {
        height: 50vh;
        object-fit: cover;
        width: 100%;
    }

    @media screen and (min-width: 800px) {
        display: flex;
        border-bottom: 1px solid #120f1a;
    }
`;

const Cover = styled.div<{ src: string }>`
    padding-top: 56.25%;
    background-image: url(${(props) => props.src});
    background-size: cover;
    background-position: center;

    @media screen and (min-width: 800px) {
        width: 60%;
        padding-top: 33.75%;
    }
`;

const OnlineTagContainer = styled.div`
    position: fixed;
    top: calc(10px + env(safe-area-inset-top));
    top: calc(10px + constant(safe-area-inset-top));
    right: 14px;
    z-index: 9999;

    @media screen and (min-width: 1224px) {
        position: absolute;
        z-index: 1;
    }
`;

const Infos = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: -4%;
    background-color: ${(props) => props.theme.darkBg};
    background-color: ${(props) => props.theme.darkerBg};
    border-top-right-radius: calc(2 * ${(props) => props.theme.defaultRadius});
    color: ${(props) => props.theme.textColor};
    padding: ${(props) => props.theme.doubleSpacing} ${(props) => props.theme.biggerSpacing}
        ${(props) => props.theme.biggerSpacing};

    h4 {
        color: ${(props) => props.theme.textColorDark};
        margin: ${(props) => props.theme.regularSpacing} 0 12px;
    }

    @media screen and (min-width: 800px) {
        margin-top: 0;
        width: 40%;
    }
`;

const Title = styled.div`
    display: flex;
    flex-direction: column;

    h2 {
        text-transform: uppercase;
    }

    h3 {
        width: 80%;
        font-size: 12px;
        margin-bottom: ${(props) => props.theme.smallSpacing};
        color: ${(props) => props.theme.textColorDark};
    }
`;

export const EventHeader: React.FunctionComponent<EventHeaderProps> = (props: EventHeaderProps): JSX.Element => {
    return (
        <>
            <Header>
                <Cover src={props.cover} />
                <Infos>
                    {props.online ? (
                        <OnlineTagContainer>
                            <OnlineTag online={props.online} />
                        </OnlineTagContainer>
                    ) : null}
                    <Title>
                        <h3>{props.preName}</h3>
                        <h2>{props.name}</h2>
                    </Title>
                    <div>
                        <h4>{props.prices}</h4>
                        <VisibiltySensor onChange={props.onChange}>
                            <Button
                                variant={'custom'}
                                title={props.buttonTitle}
                                gradients={props.colors}
                                onClick={props.onClick}
                            />
                        </VisibiltySensor>
                    </div>
                </Infos>
            </Header>
        </>
    );
};

export default EventHeader;
