import React          from 'react';
import styled         from 'styled-components';
import { motion }     from 'framer-motion';
import { useHistory } from 'react-router';
import attendeesImg   from './attendees.jpg';
import salesImg   from './sales.jpg';
import invitationsImg from './invitations.jpg';
import { injectBlur } from '@frontend/flib-react/lib/utils/blur';
import { useTranslation } from 'react-i18next';
import './locales';

interface StatCardProps {
    illustration: string;
}

const StatCard = styled(motion.div)<StatCardProps>`
  position: relative;
  width: 300px;
  height: 200px;
  margin: ${props => props.theme.regularSpacing};
  border-radius: ${props => props.theme.defaultRadius};
  background-color: ${props => props.theme.darkerBg};
  background-image: url(${props => props.illustration});
  background-size: cover;
  background-position: center;
  cursor: pointer;
  overflow: hidden;
`;

const BlurCard = styled.div`
  ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 0.9)', '4px')};
  width: 300px;
  height: 200px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`

const ContentCard = styled.div`
  padding: ${props => props.theme.regularSpacing};
  width: 300px;
  height: 200px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`

export const Stats = ({eventId}: {eventId: string}): JSX.Element => {

    const history = useHistory();
    const [t] = useTranslation('stats');

    return <div
        style={{
            width: '100%',
            height: '100%',
            padding: '0 30px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap'
        }}
    >
        <StatCard
            illustration={attendeesImg}
            onClick={
                () => {
                    history.push(`/event/${eventId}/attendees`);
                }
            }
            whileTap={{
                scale: 0.98
            }}
        >
            <ContentCard>
                <h3>{t('attendees')}</h3>
                <span>{t('attendees_description')}</span>
            </ContentCard>
            <BlurCard/>
        </StatCard>
        <StatCard
            illustration={salesImg}
            onClick={
                () => {
                    history.push(`/event/${eventId}/sales`);
                }
            }
            whileTap={{
                scale: 0.98
            }}
        >
            <ContentCard>
                <h3>{t('sales')}</h3>
                <span>{t('sales_description')}</span>
            </ContentCard>
            <BlurCard/>
        </StatCard>
        <StatCard
            illustration={invitationsImg}
            onClick={
                () => {
                    history.push(`/event/${eventId}/invitations`);
                }
            }
            whileTap={{
                scale: 0.98
            }}
        >
            <ContentCard>
                <h3>{t('invitations')}</h3>
                <span>{t('invitations_description')}</span>
            </ContentCard>
            <BlurCard/>
        </StatCard>
    </div>
}
