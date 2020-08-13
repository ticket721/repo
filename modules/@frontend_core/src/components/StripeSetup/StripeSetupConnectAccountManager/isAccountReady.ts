import { StripeInterfaceEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/stripeinterface/entities/StripeInterface.entity';
export const isAccountReady = (stripeInterface: StripeInterfaceEntity): boolean => {
    return !stripeInterface.connect_account_disabled_reason;
};
