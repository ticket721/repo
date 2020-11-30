import React, { useState } from 'react';
import styled         from 'styled-components';
import { motion } from 'framer';
import { useTranslation } from 'react-i18next';
import './locales';
import appStore from './appstore.png';
import gplayStore from './gplaystore.png';

export const DownloadAppModal: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
    const [ t ] = useTranslation('download_app');
    const [ isExplanationShown, showExplanation ] = useState<boolean>(false);
    return (
        <>
            <BgDisabled
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
            }}
            onClick={closeModal}/>
            <Modal
            initial={{
                top: '100vh'
            }}
            animate={{
                top: 0,
                bottom: 0,
            }}
            exit={{
                top: '100vh'
            }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 26,
            }}>
                <Title>
                    {t('download_app_title')}
                </Title>
                <StoreLink href={'https://apps.apple.com/tj/app/ticket721/id1525128412'}>
                    <img alt={'apple store link'} src={appStore}/>
                </StoreLink>
                <StoreLink  href={'https://play.google.com/store/apps/details?id=com.ticket721.t721'}>
                    <img alt={'google play store link'} src={gplayStore}/>
                </StoreLink>
                <Explanation shown={isExplanationShown}>
                    <ExplanationLabel
                    shown={isExplanationShown}
                    onClick={() => showExplanation(true)}>{t('explanation_label')}</ExplanationLabel>
                    {
                        isExplanationShown ?
                        <ExplanationParagraph
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}>{t('explanation')}</ExplanationParagraph> :
                        null
                    }
                </Explanation>
            </Modal>
        </>
    )
};

const BgDisabled = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9998;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.9);
`;

const Modal = styled(motion.div)`
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    left: 0;
    margin: 10% auto;
    height: fit-content;
    width: 100vw;
    @media screen and (min-width: 600px) {
      width: 600px;
      left: calc((100vw - 600px) / 2);
    }
    z-index: 9999;
    border-radius: ${props => props.theme.defaultRadius};
    background-color: ${props => props.theme.darkerBg};
    padding: ${props => props.theme.biggerSpacing};
`;

const Title = styled.span`
    font-size: 20px;
    font-weight: 500;
    margin-bottom: ${props => props.theme.doubleSpacing};
    line-height: 32px;
    text-align: center;
`;

const StoreLink = styled.a`
    margin-bottom: ${props => props.theme.biggerSpacing};

    img {
        width: 250px;
    }
`;

const Explanation = styled.div<{ shown: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${props => props.theme.regularSpacing};
    background-color: ${props => props.shown ? 'rgba(0,0,0,0.2)' : null};
    border-radius: ${props => props.theme.defaultRadius};

    transition: background-color 300ms ease;
`;

const ExplanationLabel = styled.span<{ shown: boolean }>`
    font-size: 14px;
    text-decoration: ${props => props.shown ? null : 'underline'};
`;

const ExplanationParagraph = styled(motion.p)`
    font-size: 14px;
    margin-top: ${props => props.theme.regularSpacing};
`;
