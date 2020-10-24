import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface LocationHeaderProps extends React.ComponentProps<any> {
    title: string;
    location: string;
    onFilter?: () => void;
    mainColor?: string;
    online?: boolean;
}

const Container = styled.section`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 0 ${(props) => props.theme.biggerSpacing};
    width: 100%;

    h4 {
        color: ${(props) => props.theme.textColorDark};
        font-size: 13px;
        margin-bottom: 4px;
    }
`;

const LocationIcon = styled(Icon)`
    margin-right: ${(props) => props.theme.smallSpacing};
`;

const Location = styled.span`
    border-bottom: 2px solid ${(props) => props.theme.textColorDarker};
`;

export const LocationHeader: React.FunctionComponent<LocationHeaderProps> = (
    props: LocationHeaderProps,
): JSX.Element => {
    return (
        <Container onClick={props.onFilter}>
            <div>
                <h4>{props.title}</h4>
                <h3 className={'row'}>
                    <LocationIcon icon={props.online ? 'live' : 'location'} size={'16px'} color={props.online ? 'red' : props.mainColor} />
                    <Location>{props.location}</Location>
                </h3>
            </div>
        </Container>
    );
};

LocationHeader.defaultProps = {
    mainColor: '#079CF0',
};

export default LocationHeader;
