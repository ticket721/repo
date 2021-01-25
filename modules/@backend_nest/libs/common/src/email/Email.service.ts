import {
    EmailDriver,
    EmailDriverResponse,
    EmailDriverResponseStatus,
    EmailDriverSendOptions,
} from '@lib/common/email/drivers/Email.driver.base';
import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '../users/dto/User.dto';
import { ItemSummary } from '../purchases/ProductChecker.base.service';
import { formatDay, formatHour, formatShort, format } from '../utils/date';
import { format as formatCurrency } from '@common/global';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Service to send emails with selected EmailDriver
 */
@Injectable()
export class EmailService {
    /**
     * Dependency Injection
     *
     * @param emailDriver
     */
    constructor(private readonly emailDriver: EmailDriver) {}

    /**
     * Send an email to the target email address. Compiles and injects locals
     * into selected template.
     *
     * @param options
     */
    async send(options: EmailDriverSendOptions): Promise<ServiceResponse<EmailDriverSendOptions>> {
        const result: EmailDriverResponse = await this.emailDriver.send(options);
        switch (result.status) {
            case EmailDriverResponseStatus.Sent: {
                return {
                    error: null,
                    response: options,
                };
            }

            case EmailDriverResponseStatus.Error: {
                return {
                    error: result.reason,
                    response: options,
                };
            }
        }
    }

    /**
     * Send a invitation summary email to the target email address. Compiles and injects locals
     * into summary template.
     *
     * @param userMail
     * @param locale
     * @param data
     * @param appUrl
     * @param timezone
     */
    async sendInvitationsSummary(
        userMail: string,
        locale: string,
        data: {
            invitations: {
                amount: number;
                dates: DateEntity[];
            }[];
            hasAccount: boolean;
        },
        appUrl?: string,
        timezone?: string,
    ): Promise<ServiceResponse<EmailDriverSendOptions>> {
        try {
            const sameDay = (d1: Date, d2: Date): boolean => {
                return (
                    d1.getFullYear() === d2.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate()
                );
            };

            const getDateString = (beginTimestamp: number, endTimestamp: number): string => {
                if (sameDay(new Date(beginTimestamp), new Date(endTimestamp))) {
                    return `${formatDay(beginTimestamp, locale, timezone)},
                 ${formatHour(beginTimestamp, locale, timezone)} → ${formatHour(endTimestamp, locale, timezone)}`;
                }
                return `${formatShort(beginTimestamp, locale, timezone)} → ${formatShort(
                    endTimestamp,
                    locale,
                    timezone,
                )}`;
            };

            const total = data.invitations.map(iv => iv.amount).reduce((agg, iv) => agg + iv, 0);

            const locals = {
                subjectSuffix: ` ${total} Ticket${total > 1 ? 's' : ''}`,
                purchasedDate: format(Date.now(), locale, timezone),
                registerUrl: appUrl ? appUrl + '/register' : null,
                loginUrl: appUrl ? appUrl + '/login' : null,
                hasAccount: data.hasAccount,
                invitations: data.invitations.map(invitation => ({
                    count: invitation.amount,
                    dates: invitation.dates.map((d: DateEntity) => {
                        const beginDateTimestamp: number = (typeof d.timestamps.event_begin === 'string'
                            ? new Date(d.timestamps.event_begin)
                            : d.timestamps.event_begin
                        ).getTime();
                        const endDateTimestamp: number = (typeof d.timestamps.event_end === 'string'
                            ? new Date(d.timestamps.event_end)
                            : d.timestamps.event_end
                        ).getTime();
                        return {
                            coverUrl: d.metadata.avatar,
                            url: appUrl ? appUrl + '/event/' + d.id : null,
                            rangeDates: getDateString(beginDateTimestamp, endDateTimestamp),
                            name: d.metadata.name,
                            location: d.online ? 'Online' : d.location.location_label,
                        };
                    }),
                })),
            };

            return await this.send({
                template: 'invitationReceived',
                to: userMail,
                locale,
                locals,
            });
        } catch (e) {
            console.error(e);
            return {
                error: e.message,
                response: null,
            };
        }
    }
    /**
     * Send a purchase summary email to the target email address. Compiles and injects locals
     * into summary template.
     *
     * @param user
     * @param data
     * @param appUrl
     * @param timezone
     */
    async sendPurchaseSummary(
        user: UserDto,
        data: {
            price: { total: number; fees: number; currency: string };
            items: ItemSummary<any>[];
        },
        appUrl?: string,
        timezone?: string,
    ): Promise<ServiceResponse<EmailDriverSendOptions>> {
        try {
            const sameDay = (d1: Date, d2: Date): boolean => {
                return (
                    d1.getFullYear() === d2.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate()
                );
            };

            const getDateString = (beginTimestamp: number, endTimestamp: number): string => {
                if (sameDay(new Date(beginTimestamp), new Date(endTimestamp))) {
                    return `${formatDay(beginTimestamp, user.locale, timezone)},
                 ${formatHour(beginTimestamp, user.locale, timezone)} → ${formatHour(
                        endTimestamp,
                        user.locale,
                        timezone,
                    )}`;
                }
                return `${formatShort(beginTimestamp, user.locale, timezone)} → ${formatShort(
                    endTimestamp,
                    user.locale,
                    timezone,
                )}`;
            };

            const locals = {
                subjectSuffix: ` | ${data.items.length} Ticket${data.items.length > 1 ? 's' : ''}`,
                username: user.username,
                totalPrice: data.price.currency ? formatCurrency(data.price.currency, data.price.total) : null,
                fees: data.price.currency ? formatCurrency(data.price.currency, data.price.fees) : null,
                purchasedDate: format(Date.now(), user.locale, timezone),
                walletUrl: appUrl ? appUrl + '/wallet' : null,
                tickets: [],
            };

            for (const item of data.items) {
                if (item.type === 'ticket') {
                    const ticketIdx = locals.tickets.findIndex(ticket => ticket.categoryId === item.data.categoryId);
                    if (ticketIdx === -1) {
                        const datesCount = item.data.dates.length;
                        const computedLocation = item.data.dates[0].online ? 'Online' : item.data.dates[0].location;

                        locals.tickets.push({
                            ...item.data,
                            seats: 1,
                            ids: [item.data.ticketId],
                            markupEventName: item.data.dates[0].name + (datesCount > 1 ? ` +${datesCount - 1}` : ''),
                            markupLocation: computedLocation + (datesCount > 1 ? ` +${datesCount - 1}` : ''),
                            markupCoverUrl: item.data.dates[0].coverUrl,
                            markupStartDate: format(
                                (typeof item.data.dates[0].beginDate === 'string'
                                    ? new Date(item.data.dates[0].beginDate)
                                    : item.data.dates[0].beginDate
                                ).getTime(),
                                user.locale,
                                timezone,
                            ),
                            dates: item.data.dates.map(date => {
                                const beginDateTimestamp: number = (typeof date.beginDate === 'string'
                                    ? new Date(date.beginDate)
                                    : date.beginDate
                                ).getTime();
                                const endDateTimestamp: number = (typeof date.endDate === 'string'
                                    ? new Date(date.endDate)
                                    : date.endDate
                                ).getTime();

                                return {
                                    ...date,
                                    url: appUrl ? appUrl + '/event/' + date.id : null,
                                    rangeDates: getDateString(beginDateTimestamp, endDateTimestamp),
                                    location: date.online ? 'Online' : date.location,
                                };
                            }),
                        });
                    } else {
                        locals.tickets[ticketIdx].ids.push(item.data.ticketId);
                        locals.tickets[ticketIdx].seats = locals.tickets[ticketIdx].seats + 1;
                    }
                }
            }

            return await this.send({
                template: 'purchaseSummary',
                to: user.email,
                locale: user.locale,
                locals,
            });
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }
}
