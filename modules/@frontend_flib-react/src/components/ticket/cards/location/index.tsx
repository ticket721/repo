import * as React from 'react';
import styled from '../../../../config/styled';
import CardContainer from '../../../elements/card-container';
import Separator from '../../../elements/separator';
import Icon from '../../../icon';
import { Map, TileLayer, withLeaflet } from 'react-leaflet';
// tslint:disable-next-line:no-var-requires
const { android, ios, macos } = require('platform-detect/os.mjs').default;

interface Coords {
    lat: number;
    lon: number;
}

export interface LocationCardProps extends React.ComponentProps<any> {
    location: string;
    iconColor?: string;
    link?: string;
    linkLabel?: string;
    removeBg?: boolean;
    wSeparator?: boolean;
    coords?: Coords;
}

const Info = styled.span`
    &:first-of-type {
        margin-top: 2px;
    }
`;

const EndLinkSpan = styled.span`
    margin-right: ${(props) => props.theme.regularSpacing};
`;

const EndColumn = styled.div<LocationCardProps>`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 90%;
    color: ${(props) => props.textColor};
`;

const Column = styled.div<LocationCardProps>`
    display: flex;
    flex-direction: column;
    max-width: 85%;
    color: ${(props) => props.textColor};

    a {
        align-items: center;
        display: inline-flex;
        margin-top: ${(props) => props.theme.regularSpacing};

        svg {
            margin-left: ${(props) => props.theme.smallSpacing};
        }

        ${(props) =>
            props.iconColor &&
            `
      color: ${props.iconColor};
    `}
    }
`;

const IconContainer = styled.div`
    margin-right: ${(props) => props.theme.regularSpacing};
`;

const ClickableContainer = styled.div`
    cursor: pointer;
`;

const openMap = (location: string) => {
    if (ios || macos) {
        window.open(`maps://maps.apple.com/?q=${encodeURI(location)}`);
    } else if (android) {
        window.open(`geo:${encodeURI(location)}`);
    } else {
        window.open(`https://maps.google.com/?q=${encodeURI(location)}`);
    }
};

export const LocationCard: React.FunctionComponent<LocationCardProps & { className?: string }> = (
    props: LocationCardProps,
): JSX.Element => {
    return (
        <ClickableContainer onClick={() => openMap(props.location)}>
            <CardContainer className={props.className} removeBg={props.removeBg}>
                <IconContainer>
                    <Icon icon={'pin'} size={'16px'} color={props.iconColor} />
                </IconContainer>
                <Column iconColor={props.iconColor}>
                    <Info>{props.location}</Info>
                </Column>
                {props.wSeparator && <Separator />}
            </CardContainer>
            {props.coords ? (
                <>
                    <LeafletMap coords={props.coords} />
                    <CardContainer className={props.className} removeBg={props.removeBg}>
                        <EndColumn textColor={props.iconColor}>
                            <EndLinkSpan>Get directions</EndLinkSpan>
                        </EndColumn>
                        <IconContainer>
                            <Icon icon={'arrow'} size={'16px'} color={props.iconColor} />
                        </IconContainer>
                        {props.wSeparator && <Separator />}
                    </CardContainer>
                </>
            ) : null}
        </ClickableContainer>
    );
};

const MapContainer = styled.div`
    .leaflet-container {
        width: 100vw;
        height: 300px;
    }

    .leaflet-left {
        visibility: hidden;
    }
`;

const LeafletMap = withLeaflet((props: any) => (
    <MapContainer>
        <Map
            center={{ lat: props.coords.lat, lng: props.coords.lon }}
            zoom={18}
            dragging={false}
            keyboard={false}
            doubleClickZoom={false}
            tap={false}
            scrollWheelZoom={false}
            touchZoom={false}
        >
            <TileLayer
                attribution={'&copy; <a href="http://osm.org/copyright"></a>'}
                url={'https://{s}.tile.osm.org/{z}/{x}/{y}.png'}
            />
        </Map>
    </MapContainer>
));

export default LocationCard;
