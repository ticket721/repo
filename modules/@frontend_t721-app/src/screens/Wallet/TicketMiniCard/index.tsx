import React                     from 'react';
import { useHistory }                          from 'react-router';
import { DateEntity }                          from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import styled                    from 'styled-components';
import { motion }                from 'framer';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/hooks/useHaptics';
import { formatShort }                    from '@frontend/core/lib/utils/date';
import { OnlineBadge } from '@frontend/flib-react/lib/components/events/single-image/OnlineTag';
import { useTranslation }        from 'react-i18next';
import './locales';

const TicketMiniCardContainer = styled(motion.div)`
    width: 100%;
    max-width: 500px;
    background-color: ${props => props.theme.darkerBg};
    border-radius: ${props => props.theme.defaultRadius};
    margin-top: ${props => props.theme.regularSpacing};
    padding: ${props => props.theme.smallSpacing};
    display: flex;
    flex-direction: row;
    overflow: hidden;
`

interface DateIconProps {
    width: number;
    height: number;
    avatar: string;
    online: boolean;
}

const DateIconContainer = styled.div<DateIconProps>`
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: ${props => props.theme.defaultRadius};
  background-image: url(${props => props.avatar});
  background-size: cover;
  background-position: center;
`

const DateIcon = (props: DateIconProps) => {
    return <DateIconContainer
        width={props.width}
        height={props.height}
        avatar={props.avatar}
        online={props.online}
    >
        {
            props.online

                ?
                <div
                    style={{
                        position: 'absolute',
                        right: 3,
                        top: 3
                    }}
                >
                    <OnlineBadge/>
                </div>

                :
                null
        }
    </DateIconContainer>
}

const DateInfosContainer = styled.div`
    position: relative;
    width: calc(100% - 80px - ${props => props.theme.regularSpacing});
    height: 80px;
    margin-left: ${props => props.theme.regularSpacing};
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-start;
    padding-top: 4px;
    padding-bottom: 4px;
`

interface CategoryNameProps {
    gradientStart: string;
    gradientEnd: string;
}

const CategoryName = styled.span<CategoryNameProps>`
    display: block;
    width: calc(100%);
    font-size: 18px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 120%;
    background: -webkit-linear-gradient(260deg, ${(props) => props.gradientStart}, ${(props) => props.gradientEnd});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`

const DateTitle = styled.span`
    display: block;
    width: calc(100%);
    font-size: 18px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 120%;
`

const DateTime = styled.span`
    display: block;
    width: calc(100%);
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 120%;
`

const Banner = styled.div<{ colors: string[] }>`
    position: absolute;
    top: 12px;
    right: -34px;
    font-size: 12px;
    font-weight: 500;
    transform: rotate(45deg);
    text-transform: uppercase;
    padding: ${props => props.theme.smallSpacing} 20px 4px;
    background: linear-gradient(270deg, ${props => props.colors[1]}, ${props => props.colors[0]});
`;

export interface TicketMiniCardProps {
    ticketId: string;
    categoryName: string;
    date: DateEntity;
    isInvitation?: boolean;
}

export const TicketMiniCard: React.FC<TicketMiniCardProps> = ({
    ticketId,
    categoryName,
    date,
    isInvitation,
}) => {
    const [t] = useTranslation('ticket_mini_card');
    const haptics = useHaptics();
    const history = useHistory();

    return <TicketMiniCardContainer
        whileTap={{
            scale: 0.98
        }}
        onClick={() => {
            haptics.impact({
                style: HapticsImpactStyle.Light,
            });
            history.push(`/ticket/${ticketId}${isInvitation ? '/invitation' : ''}`)
        }}
    >
        <DateIcon
            width={80}
            height={80}
            avatar={date.metadata.avatar}
            online={date.online}
        />
        <DateInfosContainer>
            <DateTitle>{date.metadata.name}</DateTitle>
            {
                isInvitation ?
                <Banner colors={date.metadata.signature_colors}>{t('invitation')}</Banner> :
                <CategoryName
                    gradientStart={date.metadata.signature_colors[0]}
                    gradientEnd={date.metadata.signature_colors[1]}
                >{categoryName}</CategoryName>
            }
            <DateTime>{formatShort(new Date(date.timestamps.event_begin))}</DateTime>
        </DateInfosContainer>
    </TicketMiniCardContainer>
}