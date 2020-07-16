import React, { useState }       from 'react';
import QrReader                  from 'react-qr-reader';
import styled                    from 'styled-components';
import { TopNavbar }             from './TopNavbar';
import { FullPageLoading, Icon } from '@frontend/flib-react/lib/components';
import { DateItem }              from '../../components/EventSelection';
import { useSelector }           from 'react-redux';
import { StaffAppState }         from '../../redux';

interface ScannerProps {
    events: {
        id: string;
        name: string;
    }[];
    dates: DateItem[];
}

export const Scanner: React.FC<ScannerProps> = ({ events, dates }: ScannerProps) => {
    const dateId = useSelector((state: StaffAppState) => state.currentEvent.dateId);
    const [ loaded, setLoaded ] = useState<boolean>(false);

    return (
        <ScannerWrapper>
        <TopNavbar events={events} dates={dates}/>
        {
            dateId && !loaded ?
                <FullPageLoading/> :
                null
        }
        <ScannerZone>
            <TopContainer>
                <TopLeftCorner/>
                <TopRightCorner/>
            </TopContainer>
            <BottomContainer>
                <BottomLeftCorner/>
                <BottomRightCorner/>
            </BottomContainer>
            <ScanIcon
                icon={'scan'}
                size={'50px'}
                color={'rgba(255,255,255,0.6)'}/>
        </ScannerZone>
            {
                dateId ?
                    <QrReader
                        onScan={(data) => console.log}
                        onError={(err) => console.log(err)}
                        onLoad={() => setLoaded(true)}
                        delay={100}
                        facingMode={'environment'}
                        style={{
                            'width': '100vw',
                            'height': '100vh'
                        }}
                        showViewFinder={false} /> :
                    null
            }
        </ScannerWrapper>
);
};

const ScannerWrapper = styled.div`
    section > section {
        padding-top: 100vh !important;
    }
`;

const ScannerZone = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    top: calc((-100vh - 100vw + 2 * ${props => props.theme.doubleSpacing}) / 2);
    left: calc((-200vh + 2 * ${props => props.theme.doubleSpacing}) / 2);
    width: calc(100vw - 2 * ${props => props.theme.doubleSpacing});
    height: calc(100vw - 2 * ${props => props.theme.doubleSpacing});
    border: 100vh solid rgba(0,0,0,0.3);
    border-radius: calc(100vh + ${props => props.theme.regularSpacing});
    z-index: 1;
    box-sizing: content-box;
`;

const TopContainer = styled.div`
    position: relative;
    top: -2px;
    left: -2px;
    width: calc(100% + 4px);
    display: flex;
    justify-content: space-between;
    height: 25%;
    box-sizing: border-box;
`;

const BottomContainer = styled.div`
    position: relative;
    bottom: -2px;
    left: -2px;
    width: calc(100% + 4px);
    display: flex;
    justify-content: space-between;
    height: 25%;
    box-sizing: border-box;
`;

const TopLeftCorner = styled.div`
    width: 25%;
    height: 100;
    border-left: 5px solid ${props => props.theme.textColorDark};
    border-top: 5px solid ${props => props.theme.textColorDark};
    border-radius: ${props => props.theme.regularSpacing} 0 0 0;
`;

const TopRightCorner = styled.div`
    width: 25%;
    height: 100%;
    border-right: 5px solid ${props => props.theme.textColorDark};
    border-top: 5px solid ${props => props.theme.textColorDark};
    border-radius: 0 ${props => props.theme.regularSpacing} 0 0;
`;

const BottomRightCorner = styled.div`
    width: 25%;
    height: 100%;
    border-right: 5px solid ${props => props.theme.textColorDark};
    border-bottom: 5px solid ${props => props.theme.textColorDark};
    border-radius: 0 0 ${props => props.theme.regularSpacing} 0;
`;

const BottomLeftCorner = styled.div`
    width: 25%;
    height: 100%;
    border-left: 5px solid ${props => props.theme.textColorDark};
    border-bottom: 5px solid ${props => props.theme.textColorDark};
    border-radius: 0 0 0 ${props => props.theme.regularSpacing};
`;

const ScanIcon = styled(Icon)`
    position: absolute;
    top: calc(50% - 25px);
    left: calc(50% - 25px);
`;
