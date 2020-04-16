import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import QrCodeButton from '../../src/components/ticket/qr-code';

export default {
  title: 'Ticket|QrCode',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const QrCode = () => (
  <div className="row jcc">
    <QrCodeButton label={text('Label', 'Tap to scan your QR code')} />
  </div>
);
