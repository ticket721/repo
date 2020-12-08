import React          from 'react';
import styled         from 'styled-components';
import { motion }     from 'framer-motion';
import { useHistory } from 'react-router';
import attendeesImg   from './attendees.jpg';
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
            padding: 30
        }}
    >
        <StatCard
            illustration={attendeesImg}
            onClick={
                () => {
                    history.push(`/event/${eventId}/attendees`);
                }
            }
            whileHover={{
                scale: 1.02
            }}
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
    </div>
}
