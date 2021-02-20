/**
 * Template for the slip
 */
export const slipTemplate = `
<html>

<head>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <title>event-slip-{{eventSlipId}}</title>
    <style>
        html {
            background-color: #0a0812;
            padding-left: calc(50% - 620px);
            padding-right: calc(50% - 620px);
            font-family: 'Roboto', sans-serif;
            color: #0a0812;
        }

        body {
            background-color: #ffffff;
            width: 1240px;
            margin: 0;
        }

        #headerbanner {
            width: 100%;
        }

        #container {
            padding: 32px;
        }

        .separator {
            width: 100%;
            height: 1px;
            background-color: #0a0812;
        }

        #information-containers {
            margin: 32px;
        }

        #organizer-information {
            text-align: end;
        }

        #information-containers p {
            margin: 0;
        }

        .summary {
            margin-top: 32px;
            margin-bottom: 64px;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-table th {
            text-transform: uppercase;
        }

        .summary-table tr.highlight {
            background-color: #ccc;
        }

        .summary-table td {
            text-align: center;
        }

        .summary-table th,
        .summary-table td {
            border: 1px solid #222;
            padding: 6px;
        }

        .invisible-th {
            border: none !important;
        }

        .small-text {
            font-size: 12px;
        }

        .spacing {
            margin: 50px;
            width: 100%;
        }

        .logo {
            width: 100px;
        }

        .bold {
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div id="container">
        <div id="headerbanner">
        <table style="width: 100%;">
        <tr>
        <td>
            <p>{{orgCity}}, {{currentDate}}</p>
</td>
<td style="text-align: end;">

            <img class="logo" src="data:image/png;base64,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
" />
</td>
</tr>
</table>
        </div>
        <h1>Event Slip {{eventSlipId}}</h1>
        <div class="separator"></div>
        <div id="information-containers">
       <table style="width: 100%;">
                <tr>
                    <td>

                        <div id="event-information">
                            <p class="bold">EVENT {{eventId}}</p>
                            <p class="bold">{{eventName}}</p>
                            <p>{{eventDates}}</p>
                        </div>
                    </td>
                    <td>

                        <div id="organizer-information">
                            <p class="bold">ORGANIZER {{orgId}}</p>
                            <p class="bold">{{orgName}}</p>
                            <p>TVA ID: {{orgTvaId}}</p>
                            <p>LICENSE: {{orgLicenseId}}</p>
                            <p>{{orgStreet}}</p>
                            <p>{{orgPostalCode}}</p>
                            <p>{{orgCity}} - {{orgCountry}}</p>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <h2>{{eventName}}</h2>
        <div class="separator"></div>
        <div class="summary">

            <h4>PARTICIPANTS</h4>
            <table class="summary-table">
                <tr>
                    <th>Paid Participants</th>
                    <td>{{paidParticipantsCount}}</td>
                </tr>
                <tr>
                    <th>Free Participants</th>
                    <td>{{freeParticipantsCount}}</td>
                </tr>
                <tr>
                    <th>Invited Participants</th>
                    <td>{{invitedParticipantsCount}}</td>
                </tr>
                <tr class="highlight">
                    <th>Total participants</th>
                    <td>{{totalParticipantCount}}</td>
                </tr>
            </table>
            <div class="spacing"></div>
            <h4>TAXABLE REVENUE</h4>
            <table class="summary-table">
                <tr>
                    <th class="invisible-th"></th>
                    <th>Total excl tax</th>
                    <th>Total VAT</th>
                    <th>TOTAL incl tax</th>
                </tr>
                <tr>
                    <td class="bold">GROSS SUBTOTAL TO DECLARE</td>
                    <td>{{grossSubtotalToDeclare}} {{cl}}</td>
                    <td>{{vat}} %</td>
                    <td>{{subtotalToDeclare}} {{cl}}</td>
                </tr>
                <tr class="highlight">
                    <td class="bold">GROSS TOTAL</td>
                    <td>{{grossTotalToDeclare}} {{cl}}</td>
                    <td>{{vat}} %</td>
                    <td>{{totalToDeclare}} {{cl}}</td>
                </tr>
            </table>
            <div class="spacing"></div>
            <h4>REVENUE SLIP</h4>
            <table class="summary-table">
                <tr>
                    <th class="invisible-th"></th>
                    <th>Total excl tax</th>
                    <th>Total VAT</th>
                    <th>TOTAL incl tax</th>
                </tr>
                <tr>
                    <td class="bold">TICKETING GROSS SUBTOTAL</td>
                    <td>{{ticketingGrossSubtotal}} {{cl}}</td>
                    <td>{{vat}} %</td>
                    <td>{{ticketingSubtotal}} {{cl}}</td>
                </tr>
                <tr>
                    <td class="bold">TICKETING GROSS TOTAL</td>
                    <td>{{ticketingGrossTotal}} {{cl}}</td>
                    <td>{{vat}} %</td>
                    <td>{{ticketingTotal}} {{cl}}</td>
                </tr>
                <tr class="highlight">
                    <td class="bold">REVENUE TOTAL</td>
                    <td>{{revenueGrossTotal}} {{cl}}</td>
                    <td>{{vat}} %</td>
                    <td>{{revenueTotal}} {{cl}}</td>
                </tr>
            </table>
        </div>
        <div style="height: 16px; page-break-before: always"></div>
        <h2>SALES MADE BY TICKET721</h2>
        <div class="separator"></div>
        <div class="summary">
            <table class="summary-table small-text">
                <tr>
                    <th>Tarif Name</th>
                    <th>Tarif ID</th>
                    <th>version</th>
                    <th>PRICE incl tax</th>
                    <th>Quantity</th>
                    <th>TOTAL incl tax</th>
                    <th>VAT</th>
                    <th>Total VAT</th>
                    <th>TOTAL Platform Fees</th>
                    <th>TOTAL Revenue</th>
                    <th>TOTAL to declare</th>
                </tr>
                {{#each salesByCategory}}
                <tr>
                    <td>{{name}}</td>
                    <td>{{id}}</td>
                    <td>{{version}}</td>
                    <td>{{priceInclTaxes}} {{cl}}</td>
                    <td>{{quantity}}</td>
                    <td>{{totalInclTaxes}} {{cl}}</td>
                    <td>{{vat}} %</td>
                    <td>{{totalVat}} {{cl}}</td>
                    <td>{{totalPlatformFees}} {{cl}}</td>
                    <td>{{totalRevenue}} {{cl}}</td>
                    <td>{{totalToDeclare}} {{cl}}</td>
                </tr>
                {{/each}}
                <tr class="highlight">
                    <td class="bold">TOTAL</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{{salesByCategoryTotal.quantity}}</td>
                    <td>{{salesByCategoryTotal.totalInclTaxes}} {{cl}}</td>
                    <td></td>
                    <td>{{salesByCategoryTotal.totalVat}} {{cl}}</td>
                    <td>{{salesByCategoryTotal.totalPlatformFees}} {{cl}}</td>
                    <td>{{salesByCategoryTotal.totalRevenue}} {{cl}}</td>
                    <td>{{salesByCategoryTotal.totalToDeclare}} {{cl}}</td>
                </tr>
            </table>
        </div>
        <div style="height: 16px; page-break-before: always"></div>
        <h2>TICKET721 FEES</h2>
        <div class="separator"></div>
        <div class="summary">
            <table class="summary-table small-text">
                <tr>
                    <th>Tarif Name</th>
                    <th>Tarif ID</th>
                    <th>version</th>
                    <th>Price Incl Tax</th>
                    <th>Quantity</th>
                    <th>VAT</th>
                    <th>Platform VAT</th>
                    <th>Platform Fees</th
                </tr>
                {{#each feesByCategory}}
                <tr>
                    <td>{{name}}</td>
                    <td>{{id}}</td>
                    <td>{{version}}</td>
                    <td>{{priceInclTaxes}}</td>
                    <td>{{quantity}}</td>
                    <td>{{vat}} %</td>
                    <td>{{totalPlatformVat}} {{cl}}</td>
                    <td>{{totalPlatformFees}} {{cl}}</td>
                </tr>
                {{/each}}
                <tr class="highlight">
                    <td class="bold">TOTAL</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{{feesByCategoryTotal.quantity}}</td>
                    <td></td>
                    <td>{{feesByCategoryTotal.totalPlatformVat}} {{cl}}</td>
                    <td>{{feesByCategoryTotal.totalPlatformFees}} {{cl}}</td>
                </tr>
            </table>
        </div>
    </div>
</body>

</html>
`;
