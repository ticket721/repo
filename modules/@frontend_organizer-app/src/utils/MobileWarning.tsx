import React                     from 'react';
import MediaQuery                from 'react-responsive';
import MobileWarningIllustration from './MobileWarningIllustration.png';
import styled                    from 'styled-components';
import { useTranslation }                from 'react-i18next';
import './MobileWarning.locales';

const MobileWarningContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    height: 50vh;
`;

const MobileWarningIllustrationImg = styled.img`
    width: 50vw;
`;

const MobileWarningExplainer = styled.p`
    margin-top: ${props => props.theme.regularSpacing};
`;

const MobileWarningComponent: React.FC = (props: any): JSX.Element => {

    const [ t ] = useTranslation('mobile_warning');

    return <>
        <MediaQuery maxWidth={1224}>
            <MobileWarningContainer>
                <MobileWarningIllustrationImg src={MobileWarningIllustration}/>
                <MobileWarningExplainer>{t('optimal_desktop_usage')}</MobileWarningExplainer>
            </MobileWarningContainer>
        </MediaQuery>
        <MediaQuery minWidth={1224}>
            {props.children}
        </MediaQuery>

    </>
}

export const MobileWarning = (Comp: React.ComponentType): React.FC => {

    return () => <MobileWarningComponent>
        <Comp/>
    </MobileWarningComponent>;
};
