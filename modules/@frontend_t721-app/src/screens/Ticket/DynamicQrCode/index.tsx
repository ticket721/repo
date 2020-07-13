import React                   from 'react';
import styled                  from 'styled-components';
import t721logo                from '../../../media/images/721.png';
import { useSelector }         from 'react-redux';
import { T721AppState }        from '../../../redux';
import QrCode                  from 'qrcode.react';
import { Icon }                from '@frontend/flib-react/lib/components';
import { useWindowDimensions }    from '@frontend/core/lib/hooks/useWindowDimensions';
import { hashMessage, keccak256 } from 'ethers/utils';

export interface DynamicQrCodeProps {
    qrOpened: boolean;
    name: string;
    category: string;
    ticketId: string;
    color: string;
    onClose: () => void;
}

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = (props: DynamicQrCodeProps) => {
    const { width, height } = useWindowDimensions();
    const [
        seconds,
        qrcodeContent,
    ] = useSelector((state: T721AppState) => [
        state.deviceWallet.seconds,
        state.deviceWallet.signatures[0]?.slice(2) + props.ticketId + state.deviceWallet.timestamps[0],
    ]);

    return (
        <QrCodeWrapper offsetTop={height} qrOpened={props.qrOpened}>
            <EventTitle>
                <EventName>{props.name}</EventName>
                <Category>{props.category}</Category>
            </EventTitle>
            <div>
                <QrCodeContainer>
                    <QrCode
                        value={qrcodeContent}
                        bgColor={'#241F33'}
                        fgColor={'#FFFFFF'}
                        size={width}
                        renderAs={'svg'}
                        level={'L'}
                        imageSettings={{
                            src: t721logo,
                            x: null,
                            y: null,
                            height: 42,
                            width: 42,
                            excavate: true,
                        }}/>
                        <span>{seconds}</span>
                </QrCodeContainer>
                <TicketId>{keccak256(hashMessage(props.ticketId)).slice(0, 20)}</TicketId>
            </div>
            <Close onClick={props.onClose}>
                <Icon icon={'close'} size={'32px'} color={'rgba(255,255,255,0.9)'}/>
            </Close>
        </QrCodeWrapper>
    )
};

const QrCodeWrapper = styled.div<{ offsetTop: number, qrOpened: boolean }>`
    position: fixed;
    top: ${props => props.qrOpened ? '0' : `${props.offsetTop}px` };
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(36,31,51,0.8);
    backdrop-filter: blur(6px);
    padding: 6vh ${props => props.theme.biggerSpacing};
    transition: top 300ms ease-in;
`;

const EventTitle = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const EventName = styled.h2`
    font-size: 20px;
    font-weight: 500;
    text-align: center;
    line-height: 24px;
    text-transform: uppercase;
`;

const Category = styled.h3`
    margin-top: 10px;
    font-size: 18px;
    color: ${props => props.theme.textColorDark};
`;

const QrCodeContainer = styled.div`
    position: relative;

    & > span {
        position: absolute;
        top: 50%;
        left: 50%;
        box-sizing: content-box;
        margin-top: -21px;
        margin-left: -21px;
        padding: 6px 4px 2px;
        font-size: 2em;
        font-weight: 500;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 36px;
        height: 36px;
        background-color: ${props => props.theme.darkBg};
    }
`;

const TicketId = styled.span`
    display: block;
    font-weight: 500;
    margin-top: ${props => props.theme.regularSpacing};
    color: ${props => props.theme.textColorDarker};
    text-align: center;
    text-transform: uppercase;
`;

const Close = styled.div`
`;
