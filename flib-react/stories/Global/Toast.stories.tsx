import * as React                         from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import Toast                              from '../../src/components/toast';
import { T721ToastContainer }             from '../../src/shared/toastStyles';
import 'react-toastify/dist/ReactToastify.css';
import { toast }                          from 'react-toastify';
import { Button }                         from '../../src/components/button';

export default {
  title: 'Global|Toast',
  decorators: [
    withKnobs,
  ],
  component: Toast
};

export const showcase = () => {
    const showToast = (kind: string) => {
      switch (kind) {
        case 'success':
          toast.success(<Toast kind={'success'} message={'success toast'}/>);
          break;
        case 'warning':
          toast.warning(<Toast kind={'warning'} message={'warning toast'}/>);
          break;
        case 'error':
          toast.error(<Toast kind={'error'} message={'error toast'}/>);
          break;
        default:
          toast.info(<Toast kind={'info'} message={'info toast'}/>);
      }
    };
    return (
        <div style={{
            width: '25%'
        }}>
            <Button
              title={'success'}
              onClick={() => showToast('success')}
              variant={'primary'}
            />
            <Button
              title={'warning'}
              onClick={() => showToast('warning')}
              variant={'primary'}
            />
            <Button
              title={'error'}
              onClick={() => showToast('error')}
              variant={'primary'}
            />
            <Button
              title={'info'}
              onClick={() => showToast('info')}
              variant={'primary'}
            />
              <T721ToastContainer />
        </div>
    )
};
