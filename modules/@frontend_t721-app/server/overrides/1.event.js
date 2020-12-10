const { T721SDK } = require('@common/sdk');
const removeMd = require('remove-markdown');
const template = require('../template');
const { get160Length, getLanguage } = require('../utils');

const i18n = {
    en: {
        ont721: ' on Ticket721'
    },
    fr: {
        ont721: ' sur Ticket721'
    }
};

module.exports = ({
                      APP_URL,
                      SERVER_HOST,
                      SERVER_PORT,
                      SERVER_PROTOCOL,
                  }) => {

    const sdk = new T721SDK();

    sdk.connect(SERVER_HOST, SERVER_PORT, SERVER_PROTOCOL);

    return [
        [
            '/event/:id',
            '/event/:id/*',
        ],
        (req, res, next) => {
            if (!req.custom_header) {

                const eventId = req.params.id;

                sdk
                    .dates
                    .search(null, {
                        id: {
                            $eq: eventId,
                        },
                    })
                    .then((data) => {
                        if (data.data.dates.length > 0) {
                            const date = data.data.dates[0];

                            if (date.status === 'live') {

                                let plainTextDescription = removeMd(date.metadata.description)
                                    .replace(/\n/g, ' ')
                                    .replace(/\\/g, '');

                                do {
                                    plainTextDescription = plainTextDescription.replace(/  /g, ' ');
                                } while (plainTextDescription.indexOf('  ') !== -1);

                                plainTextDescription = get160Length(plainTextDescription);

                                const lang = getLanguage(req.locale.language);

                                req.custom_header = template({
                                    title: `"${date.metadata.name}"${i18n[lang]['ont721']}`,
                                    description: plainTextDescription,
                                    og_image: date.metadata.avatar,
                                    url: `${APP_URL}${req.originalUrl}`,
                                    twitter_image: date.metadata.avatar,
                                    twitter_handle: `@ticket721`,
                                    twitter_creator_handle: date.metadata.twitter ? `@${date.metadata.twitter}` : `@ticket721`,
                                    type: 'website',
                                    locale: req.locale.language,
                                    site_name: 'Ticket721',
                                });

                            } else {
                                console.warn(`Tried to fetch metadata for preview date ${eventId}`);
                            }
                        } else {
                            console.warn(`Unknown event ${eventId}`);
                        }
                        next();
                    })
                    .catch((e) => {
                        console.error(`An error occured when fetching date info for ${eventId}`);
                        console.error(e);
                        next();
                    });
            } else {
                next();
            }

        },
    ];
};
