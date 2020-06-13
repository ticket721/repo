import React from 'react';
import { ArrowLink, LinksContainer } from '@frontend/flib-react/lib/components';

const Account: React.FC = () => {
    return (
        <LinksContainer title='Account'>
            <ArrowLink to='#todo' label='General information' />
            <ArrowLink to='#todo' label='Main city' location='Paris, France' />
        </LinksContainer>
    );
};

export default Account;
