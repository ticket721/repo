import { PasswordlessUserDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/PasswordlessUser.dto';
import { Capacitor, Plugins } from '@capacitor/core';

export const logout = async (user: PasswordlessUserDto): Promise<void> => {
    if (user) {
        switch (user.type) {
            case 'google': {
                if (Capacitor.isPluginAvailable('GoogleAuth')) {
                    try {
                        const res = await Plugins.GoogleAuth.signOut();
                        console.log(res);
                    } catch (e) {
                        console.error(e);
                        throw e;
                    }
                }

                break;
            }
            default: {
                break;
            }
        }
    }
};
