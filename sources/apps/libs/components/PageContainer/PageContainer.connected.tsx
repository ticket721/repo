import { connect } from 'react-redux';
import { AppState } from '@libs/redux/store';
import { PageContainer } from './PageContainer';

const mapStateToProps = (state: AppState) => ({
  device: state.properties.device
});

export const PageContainerConnected = connect(mapStateToProps)(PageContainer);
