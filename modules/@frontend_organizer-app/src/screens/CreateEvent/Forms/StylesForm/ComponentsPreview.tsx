import * as React                     from 'react';
import styled                         from 'styled-components';

import { TicketHeader, PreviewInfos, Button } from '@frontend/flib-react/lib/components';
import TicketInterface                from '@frontend/flib-react/lib/shared/ticketInterface';

import { useSelector }                from 'react-redux';
import { MergedAppState }             from '../../../../index';

import { useTranslation } from 'react-i18next';
import './locales';
import { useRef } from 'react';

interface ComponentsPreviewProps {
    previewSrc: string;
    colors: string[];
}

const prevTicket: TicketInterface = {
    addOns: 0,
    address: '200 Foo Street',
    endDate: 'XXXX/XX/XX',
    endTime: 'X:XXpm',
    gradients: [],
    image: '',
    location: 'Place of Foo',
    mainColor: '',
    name: 'Test Event',
    number: 0,
    startDate: 'XXXX/XX/XX',
    startTime: 'X:XXam',
    ticketId: '',
    ticketType: '<category>'
};

const Overlap = styled.div`
    margin-top: -94px;
    position: relative;
    z-index: 1;
`;

export const ComponentsPreview: React.FC<ComponentsPreviewProps> = (props: ComponentsPreviewProps) => {
    const eventName: string = useSelector((state: MergedAppState) => state.eventCreation.textMetadata.name);
    const [ t ] = useTranslation('event_creation_styles_preview');
    const previewRef = useRef(null);

    return (
        <>
            <PreviewLabel ref={previewRef}>{t('preview_label')}</PreviewLabel>
            <StyledPreview>
                <ElementLabel>{t('button_label')}</ElementLabel>
                <Button
                title={t('button')}
                variant={'custom'}
                gradients={props.colors}/>
                <ElementLabel>{t('ticket_label')}</ElementLabel>
                <Ticket>
                    <TicketHeader
                        cover={props.previewSrc} />
                    <Overlap>
                        <PreviewInfos
                            template={true}
                            bgColor={'rgb(24,22,31)'}
                            ticket={{
                                ...prevTicket,
                                name: eventName,
                                mainColor: props.colors[0],
                                gradients: [
                                    `${props.colors[0]} 15%`,
                                    props.colors[1]
                                ],
                            }}
                        />
                    </Overlap>
                </Ticket>
            </StyledPreview>
        </>
    )
};

const PreviewLabel = styled.span`
    width: 100%:
    height: 60px;
    line-height: 60px;
    margin-bottom: 15px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.8);
`;

const StyledPreview = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 8px;
    background-color: rgb(24, 22, 31);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 35px;

    & button {
        width: 380px;
        margin: 20px 0 40px;
        outline: none;
    }
`;

const ElementLabel = styled.span`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
    width: 380px;
`;

const Ticket = styled.div`
    width: 380px;
    margin-top: 20px;
    border-radius: 8px;
    overflow: hidden;
`;
