// const catchLiveTicket721Com = (onlineLink: string, ip: string, date: DateEntity): string => {
//     const url = new URL(onlineLink);
//
//     const type = url.searchParams.get('type');
//
//     switch (type) {
//         case 'vimeo': {
//             const vimeoId = url.searchParams.get('vimeo_id');
//             const chatId = url.searchParams.get('vimeo_chat_id');
//             const payload = btoa(JSON.stringify({
//                 ip,
//                 urls: [{
//                     url: `https://player.vimeo.com/video/${vimeoId}`,
//                     landscape: {
//                         top: '0',
//                         left: '0',
//                         height: '100%',
//                         width: '50%'
//                     },
//                     portrait: {
//                         top: '0',
//                         left: '0',
//                         height: '50%',
//                         width: '100%'
//                     }
//                 }, {
//                     url: `https://vimeo.com/live-chat/${vimeoId}${chatId ? '/' + chatId : ''}`,
//                     landscape: {
//                         top: '0',
//                         left: '50%',
//                         height: '100%',
//                         width: '50%'
//                     },
//                     portrait: {
//                         top: '50%',
//                         left: '0',
//                         height: '50%',
//                         width: '100%'
//                     }
//                 }]
//             }));
//
//             const destination = `https://live.ticket721.com?_=${payload}`;
//
//             window.location.href = destination;
//
//             return destination
//         }
//     }
//
//     return null
//
// }

// const catchExceptions = (onlineLink: string, ip: string, date: DateEntity): string => {
//     const url = new URL(onlineLink);
//
//     switch (url.hostname) {
//         case 'live.ticket721.com': {
//             return catchLiveTicket721Com(onlineLink, ip, date);
//         }
//     }
//
//     return null;
// }

export const onlineLinkWrapper = async (dispatch, t, onlineLink, date): Promise<void> => {
    window.location.href = onlineLink;
    return ;
    // publicIp
    //     .v4()
    //     .then(
    //         ip => {
    //             const caughtType = catchExceptions(onlineLink, ip, date);
    //
    //             if (!caughtType) {
    //                 const payload = btoa(JSON.stringify({
    //                     ip,
    //                     url: onlineLink,
    //                 }));
    //
    //                 window.location.href = `https://live.ticket721.com/?_=${payload}`;
    //             }
    //
    //         },
    //     )
    //     .catch(
    //         () => {
    //             dispatch(PushNotification(t('ip_fetch_error'), 'error'));
    //         },
    //     );
};

