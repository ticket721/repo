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
    linkLabel?: string;
    removeBg?: boolean;
    wSeparator?: boolean;
    coords?: Coords;
    subtitle?: string;
    get_directions?: string;
    disabled?: boolean;
    online?: boolean;
    online_label?: string;
    online_sublabel?: string;
}

const Info = styled.span`
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 16px;

    &:first-of-type {
        margin-top: 2px;
    }

    &:last-of-type {
        color: ${(props) => props.theme.textColorDark};
        margin-top: 8px;
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
    max-width: calc(100% - ${(props) => props.theme.regularSpacing} - 12px);
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
            <CardContainer className={props.className} removeBg={props.removeBg}>
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
                        <Info
                            style={{
                                fontWeight: 400,
                            }}
                        >
                            {props.online_sublabel}
                        </Info>
                    </Column>
                ) : (
                    <Column iconColor={props.iconColor}>
                        <Info>{props.location}</Info>
                        <Info
                            style={{
                                fontWeight: 400,
                            }}
                        >
                            {props.subtitle}
                        </Info>
                    </Column>
                )}
                {props.wSeparator && <Separator />}
            </CardContainer>
            {props.coords ? (
                <>
                    <LeafletMap coords={props.coords} />
                    <CardContainer className={props.className} removeBg={props.removeBg}>
                        <EndColumn textColor={props.iconColor}>
                            <EndLinkSpan>{props.get_directions}</EndLinkSpan>
                        </EndColumn>
                        <IconContainer>
                            <Icon icon={'arrow'} size={'14px'} color={props.iconColor} />
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
        width: 100%;
        height: 50vw;
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
