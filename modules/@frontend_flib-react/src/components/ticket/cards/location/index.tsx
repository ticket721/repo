import * as React from 'react';
import styled from '../../../../config/styled';
import CardContainer from '../../../elements/card-container';
import Icon from '../../../icon';
import { Map, Marker, TileLayer, withLeaflet } from 'react-leaflet';
// tslint:disable-next-line:no-var-requires
const { android, ios, macos } = require('platform-detect/os.mjs').default;

interface Coords {
    lat: number;
    lon: number;
}

export interface LocationCardProps extends React.ComponentProps<any> {
    location: string;
    iconColor?: string;
    linkLabel?: string;
    removeBg?: boolean;
    coords?: Coords;
    subtitle?: string;
    disabled?: boolean;
    online?: boolean;
    online_label?: string;
    online_sublabel?: string;
    paddingOverride?: string;
    ticketFormat?: boolean;
    bottomLeftRadius?: string;
    small?: boolean;
}

const Info = styled.span`
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 16px;

    &:last-of-type {
        color: ${(props) => props.theme.textColorDark};
        margin-top: 8px;
    }

    &:first-of-type {
        color: ${(props) => props.theme.textColor};
        margin-top: 2px;
    }
`;

const Column = styled.div<LocationCardProps>`
    display: flex;
    flex-direction: column;
    max-width: calc(100% - ${(props) => props.theme.regularSpacing} - 20px);
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
        <ClickableContainer onClick={() => (!props.disabled ? openMap(props.location) : null)}>
            <CardContainer
                className={props.className}
                paddingOverride={props.paddingOverride}
                removeBg={props.removeBg}
            >
                <IconContainer>
                    <Icon
                        icon={props.online ? 'live' : 'pin'}
                        size={'16px'}
                        color={props.online ? 'red' : props.iconColor}
                    />
                </IconContainer>
                {props.online ? (
                    <Column iconColor={props.iconColor}>
                        <Info>{props.online_label}</Info>
                        {!props.small ? (
                            <Info
                                style={{
                                    fontWeight: 400,
                                }}
                            >
                                {props.online_sublabel}
                            </Info>
                        ) : null}
                    </Column>
                ) : (
                    <Column iconColor={props.iconColor}>
                        <Info>{props.location}</Info>
                        {!props.small ? (
                            <Info
                                style={{
                                    fontWeight: 400,
                                }}
                            >
                                {props.subtitle}
                            </Info>
                        ) : null}
                    </Column>
                )}
            </CardContainer>
            {props.coords ? (
                <>
                    <LeafletMap
                        coords={props.coords}
                        ticketFormat={props.ticketFormat}
                        bottomLeftRadius={props.bottomLeftRadius}
                    />
                </>
            ) : null}
        </ClickableContainer>
    );
};

interface MapContainerProps {
    ticketFormat: boolean;
    bottomLeftRadius: string;
}

const MapContainer = styled.div<MapContainerProps>`
    display: flex;
    justify-content: center;

    .leaflet-container {
        -webkit-mask-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC);
        overflow: hidden;
        border-bottom-left-radius: ${(props) => props.bottomLeftRadius};

        ${(props) =>
            props.ticketFormat
                ? `
        width: 100%;
        height: 150px;
        padding-top: 150px;
    `
                : `
        width: 100%;
        padding-top: 100%;
        border-radius: ${props.theme.defaultRadius};
        @media screen and (max-width: 900px) {
            height: 150px;
            padding-top: 150px;
            border-radius: 0;
        }
    `}
    }

    .leaflet-left {
        visibility: hidden;
    }
`;

const LeafletMap = withLeaflet((props: any) => (
    <MapContainer ticketFormat={props.ticketFormat} bottomLeftRadius={props.bottomLeftRadius || '0px'}>
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
                attribution={''}
                url={'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
            />
            <Marker position={{ lat: props.coords.lat, lng: props.coords.lon }} />
        </Map>
    </MapContainer>
));

export default LocationCard;
