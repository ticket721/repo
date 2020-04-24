import React        from 'react';
import { AppState } from '@frontend/core/lib/redux';
import { connect }  from 'react-redux';

export interface TestProps {
    title: string;
}

interface TestRState {
    device: string;
    browser: string;
}

type MergedProps = TestProps & TestRState;

const Test: React.FC<MergedProps> = (props: MergedProps) => {
    const { title, device, browser } = props;

    return (
        <div className='Test'>
            { title }: { device } { browser }
        </div>
    )
};

const mapStateToProps = (state: AppState): TestRState => ({
    device: state.userProperties.user.device,
    browser: state.userProperties.user.browser
});

export default connect(mapStateToProps)(Test);
