import { DateCreationPayload, DatePayload, TextMetadata } from '@common/global';
import { DateEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';

export const formatDateEntity = (date: DateEntity): DateCreationPayload => ({
    info: {
        online: date.online,
        online_link: date.online_link || undefined,
        name: date.metadata.name,
        eventBegin: date.timestamps.event_begin,
        eventEnd: date.timestamps.event_end,
        location: date.location
            ? {
                  label: date.location.location_label,
                  lon: date.location.location.lon,
                  lat: date.location.location.lat,
              }
            : undefined,
    },
    textMetadata: {
        name: date.metadata.name,
        description: date.metadata.description,
        twitter: date.metadata.twitter,
        website: date.metadata.website,
        facebook: date.metadata.facebook,
        email: date.metadata.email,
        linked_in: date.metadata.linked_in,
        tiktok: date.metadata.tiktok,
        instagram: date.metadata.instagram,
        spotify: date.metadata.spotify,
    },
    imagesMetadata: {
        avatar: date.metadata.avatar,
        signatureColors: date.metadata.signature_colors as [string, string],
    },
});

export const nullifyUnsetSocials = (textMetadata: TextMetadata): TextMetadata => ({
    ...textMetadata,
    twitter: textMetadata.twitter || null,
    website: textMetadata.website || null,
    facebook: textMetadata.facebook || null,
    email: textMetadata.email || null,
    linked_in: textMetadata.linked_in || null,
    tiktok: textMetadata.tiktok || null,
    instagram: textMetadata.instagram || null,
    spotify: textMetadata.spotify || null,
});

export const formatDateTypology = (dateAndTypology: DatePayload): DatePayload => ({
    ...dateAndTypology,
    online_link: dateAndTypology.online ? dateAndTypology.online_link || null : null,
    location: !dateAndTypology.online ? dateAndTypology.location : null,
});
