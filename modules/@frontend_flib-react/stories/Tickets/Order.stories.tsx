import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import styled from '../../src/config/styled';

import SingleImage from '../../src/components/events/single-image';
import TicketQty from '../../src/components/ticket/ticket-qty';
import AddOns from '../../src/components/cards/add-ons';
import DescriptonLink from '../../src/components/cards/description-link';
import Gradient from '../../src/components/elements/gradient';
import Border from '../../src/components/elements/border';
import PurchaseTotal from '../../src/components/ticket/total';
import TopNav from '../../src/components/ticket/top-nav';
import EventCta from '../../src/components/events/cta';
import EventInfos from '../../src/components/events/infos';

export default {
    title: 'Ticket|Order',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

const event = {
    name: 'Ticket #1',
    location: 'Philharmonie de Paris',
    address: '221 avenue Jean Jaurès, Paris',
    startDate: '2020/02/14',
    endDate: '2020/20/15',
    startTime: '2:00PM',
    endTime: '4:00PM',
    about:
        'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.',
    refundPolicy: {
        title: '10 days before',
        description: 'Sed ac mattis elit, aliquam lobortis purus. Suspendisse a ex et mattis.',
        link: '#todo',
    },
    tags: [],
    resale: true,
    hostedBy: {
        name: 'Band',
        image: 'assets/images/band-1.jpg',
        spotifyUrl: 'https://spotify.com',
        numberEvents: 12,
        eventsLink: 'todo',
    },
    gradients: ['#EBBC16', '#DB535B'],
    mainColor: '#EBBC16',
    image: 'assets/images/ticket-1.jpg',
    photos: ['assets/images/event-1.jpg', 'assets/images/event-2.jpg', 'assets/images/event-3.jpg'],
};

const addOns = [
    {
        id: 'a12',
        name: '2 free beers',
        price: 15,
        description: 'Get 2 free beers for 15€',
        quantity: 3,
    },
    {
        id: 'a12',
        name: 'VIP access',
        price: 150,
        description: 'Get VIP access',
        quantity: 3,
    },
];

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];
const Container = styled.section`
    margin-bottom: 148px;
`;

const Header = styled.header`
    margin: 64px 24px 0;
    position: relative;
    z-index: 1;
`;

export const showcase = () => (
    <div>
        <TopNav label={'Tall heights tour 2020'} />
        <Header>
            <h1>Review your order</h1>
            <SingleImage src={'assets/images/ticket-1.jpg'} id={1} imgOnly />
        </Header>
        <Container>
            <Gradient values={gradientsValues} blurOnly />

            <EventInfos
                pullUp={true}
                name={event.name}
                mainColor={event.mainColor}
                location={event.location}
                startDate={event.startDate}
                gradients={event.gradients}
                startTime={event.startTime}
                endDate={event.endDate}
                endTime={event.endTime}
                getDirections={'Get directions'}
            />
            <Border />
            <TicketQty
                color={'#DB535B'}
                fees={'55 euro'}
                selected={true}
                price={'55€'}
                title={'Tickets'}
                ticketsLeft={10}
                typeName={'2 days VIP pass'}
                options={[
                    {
                        label: '1',
                        value: '1',
                    },
                ]}
                initialOption={{
                    label: '1',
                    value: '1',
                }}
                gradient={gradientsValues}
                onChange={action('onChange')}
            />
            <Border />
            <AddOns onChange={action('change')} title={'Add-ons'} addOns={addOns} gradient={gradientsValues} />
            <Border />
            <DescriptonLink
                subtitle={'Refund policy'}
                title={'Hello'}
                text={'ndisse a ex et lorem mattis faucibus rhoncus at just'}
                link={'#todo'}
            />
            <Border />
            <PurchaseTotal
                totalLabel={text('Total', 'Total')}
                subtotalLabel={text('Subtotal', 'Subtotal')}
                label={text('Review Order', 'Review Order')}
                total={[
                    {
                        name: 'Tickets',
                        price: 100,
                    },
                ]}
                fees={[
                    {
                        name: 'Tickets',
                        price: 100,
                    },
                ]}
            />
        </Container>
        <EventCta ctaLabel={'Purchase'} onClick={action('click')} show subtitle={'150€'} title={'Total'} />
    </div>
);
