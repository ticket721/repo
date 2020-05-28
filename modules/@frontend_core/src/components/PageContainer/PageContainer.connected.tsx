import { connect } from 'react-redux';
import { AppState } from '../../redux';
import { PageContainer } from './PageContainer';

const mapStateToProps = (state: AppState) => ({
    device: state.userProperties.user.device,
});

export const PageContainerConnected = connect(mapStateToProps)(PageContainer);
