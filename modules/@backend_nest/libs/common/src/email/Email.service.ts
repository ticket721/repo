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
import parseISO from 'date-fns/parseISO';

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
     * Send a purchase summary email to the target email address. Compiles and injects locals
     * into summary template.
     *
     * @param user
     * @param data
     */
    async sendPurchaseSummary(
        user: UserDto,
        data: {
            price: { total: number; fees: number; currency: string };
            items: ItemSummary<any>[];
        },
        actionUrl?: string,
    ): Promise<ServiceResponse<EmailDriverSendOptions>> {
        const DTFormat = new Intl.DateTimeFormat(user.locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
        });

        const locals = {
            subjectSuffix: ` | ${data.items.length} Tickets`,
            username: user.username,
            totalPrice: data.price.total
                ? `${data.price.total / 100}${data.price.currency === 'EUR' ? '€' : data.price.currency}`
                : 0,
            fees: data.price.fees
                ? `${data.price.fees / 100}${data.price.currency === 'EUR' ? '€' : data.price.currency}`
                : 0,
            purchasedDate: DTFormat.format(Date.now()),
            walletUrl: actionUrl ? actionUrl + '/wallet' : null,
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
                        markupStartDate: item.data.dates[0].beginDate,
                        dates: item.data.dates.map(date => {
                            const checkedBeginDate =
                                typeof date.beginDate === 'string' ? parseISO(date.beginDate) : date.beginDate;
                            const checkedEndDate =
                                typeof date.endDate === 'string' ? parseISO(date.endDate) : date.endDate;

                            return {
                                ...date,
                                url: actionUrl ? actionUrl + '/event/' + date.id : null,
                                beginDate: DTFormat.format(checkedBeginDate),
                                endDate: DTFormat.format(checkedEndDate),
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
    }
}
