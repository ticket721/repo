import React, { useEffect, useState } from 'react';
import styled, { useTheme }           from 'styled-components';
import { useSelector }                from 'react-redux';
import { T721AppState }               from '../../../redux';
import QrCode                         from 'qrcode.react';
import { Icon }                       from '@frontend/flib-react/lib/components';
import { useWindowDimensions }        from '@frontend/core/lib/hooks/useWindowDimensions';
import { Theme }                      from '@frontend/flib-react/lib/config/theme';
import { Brightness }                 from '@ionic-native/brightness';
import { motion }                              from 'framer';
import { HapticsNotificationType, useHaptics } from '@frontend/core/lib/utils/useHaptics';

export interface DynamicQrCodeProps {
    name: string;
    category: string;
    color: string;
    onClose: () => void;
}

const setBrightness = (value: number) => {

    if (Brightness && Brightness.setBrightness) {
        Brightness.setBrightness(value)
            .catch(e => {
                console.warn(e);
            })
    } else {
        console.warn('Current device cannot set brightness');
    }

};

const getBrightness = (): Promise<number> => {

    if (Brightness && Brightness.getBrightness) {
        return Brightness.getBrightness();
    } else {
        return Promise.resolve(null);
    }

};

export const DynamicQrCode: React.FC<DynamicQrCodeProps> = (props: DynamicQrCodeProps) => {
    const { width } = useWindowDimensions();
    const [initialBrightness, setInitialBrightness] = useState(null);
    const [
        qrcodeContent,
        ticketId,
    ] = useSelector((state: T721AppState) => [
        state.deviceWallet.signatures[0]?.slice(2) + state.deviceWallet.currentTicketId?.slice(2) + state.deviceWallet.timestamps[0],
        state.deviceWallet.currentTicketId,
    ]);
    const theme = useTheme() as Theme;
    const haptics = useHaptics();

    useEffect(() => {
        getBrightness()
            .then((val: number) => {
                setInitialBrightness(val);
            })
            .catch((e: Error) => {
                console.warn(e);
            });
    }, []);

    useEffect(() => {
        if (initialBrightness !== null) {
            setBrightness(0.8);
            return () => {
                setBrightness(initialBrightness)
            }
        }
    }, [initialBrightness]);

    return (
        <QrCodeWrapper
            initial={{
                top: '100vh'
            }}
            animate={{
                top: 0,
            }}
            exit={{
                top: '100vh',
            }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 26,
            }}>
            <EventTitle>
                <EventName>{props.name}</EventName>
                <Category>{props.category}</Category>
            </EventTitle>
            <div>
                <QrCodeContainer>
                    {
                        qrcodeContent

                            ?
                            <QrCode
                                value={qrcodeContent}
                                bgColor={'#FFFFFF'}
                                fgColor={theme.darkerBg}
                                size={width > 500 ? 500 : width}
                                renderAs={'svg'}
                                level={'L'}
                                includeMargin={true}
                            />

                            :
                            null
                    }

                </QrCodeContainer>
                {
                    ticketId ?
                        <TicketId>{ticketId}</TicketId> :
                        null
                }
            </div>
            <Close onClick={() => {
                haptics.notification({
                    type: HapticsNotificationType.WARNING
                });
                props.onClose()
            }}>
                <Icon icon={'close'} size={'32px'} color={theme.darkerBg}/>
            </Close>
        </QrCodeWrapper>
    )
};

const QrCodeWrapper = styled(motion.div)`
    position: fixed;
    display: flex;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    background-color: #ffffff;
    backdrop-filter: blur(6px);
    padding: 6vh ${props => props.theme.biggerSpacing};
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
    color: ${props => props.theme.darkerBg};
`;

const Category = styled.h3`
    margin-top: 10px;
    font-size: 18px;
    color: ${props => props.theme.darkerBg};
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
        color: #000000;
        background-color: #ffffff;
    }
`;

const TicketId = styled.span`
    display: block;
    font-weight: 500;
    margin-top: ${props => props.theme.regularSpacing};
    color: ${props => props.theme.darkerBg};
    text-align: center;
    text-transform: uppercase;
`;

const Close = styled.div`
`;
