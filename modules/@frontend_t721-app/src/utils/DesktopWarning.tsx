import React                      from 'react';
import MediaQuery                 from 'react-responsive';
import DesktopWarningIllustration from './DesktopWarningIllustration.png';
import GooglePlayButton           from './GooglePlayButton.png';
import AppStoreButton             from './AppStoreButton.png';
import styled                     from 'styled-components';
import { getEnv }                 from '@frontend/core/lib/utils/getEnv';

const DesktopWarningContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    height: 100vh;
    width: 100vw;
`;

const DesktopWarningIllustrationImg = styled.img`
  height: 500px;
`;

const StoreButtonDiv = styled.div`
  width: 300px;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StoreButton = styled.img`
  width: 200px;
`;

const DesktopWarningComponent: React.FC = (props: any): JSX.Element => {

    return <>
        <MediaQuery maxWidth={1224}>
            {props.children}
        </MediaQuery>
        <MediaQuery minWidth={1224}>
            <DesktopWarningContainer>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <DesktopWarningIllustrationImg src={DesktopWarningIllustration} height={'10%'}/>
                    <StoreButtonDiv>
                        <a href={getEnv().REACT_APP_APPSTORE_LINK}>
                            <StoreButton src={AppStoreButton}/>
                        </a>
                        <a href={getEnv().REACT_APP_PLAYSTORE_LINK}>
                            <StoreButton src={GooglePlayButton}/>
                        </a>
                    </StoreButtonDiv>
                </div>
            </DesktopWarningContainer>
        </MediaQuery>

    </>;
}

export const DesktopWarning = (Comp: React.ComponentType): React.FC => {

    return () => <DesktopWarningComponent>
    <Comp/>
    </DesktopWarningComponent>;
};
