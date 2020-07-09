import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Store, State } from '@sambego/storybook-state';
import styled from '../../src/config/styled';

import EventHeader from '../../src/components/events/header';
import LocationCard from '../../src/components/ticket/cards/location';
import DateTimeCard from '../../src/components/ticket/cards/datetime';
import ReadMore from '../../src/components/cards/read-more';
import Border from '../../src/components/elements/border';
import PhotosVideosCard from '../../src/components/cards/photos-videos';
import Gradient from '../../src/components/elements/gradient';
import TagsListCard from '../../src/components/cards/tags-list';
import EventCarousel from '../../src/components/events/carousel';
import EventCta from '../../src/components/events/cta';

const tags = [
    {
        id: 1,
        label: 'indie rock',
    },
    {
        id: 12,
        label: 'country',
    },
    {
        id: 11,
        label: 'rock',
    },
    {
        id: 41,
        label: 'rock',
    },
    {
        id: 141,
        label: 'concert',
    },
    {
        id: 91,
        label: 'rock',
    },
];

const eventDetails = {
    name: 'Ticket #1',
    location: 'Philharmonie de Paris',
    startDate: '2020/02/14',
    endDate: '2020/20/15',
    startTime: '2:00PM',
    about:
        'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.',
    tags,
    resale: true,
    endTime: '4:00PM',
    gradients: ['#EBBC16', '#DB535B'],
    mainColor: '#EBBC16',
    image: 'assets/images/ticket-1.jpg',
    photos: ['assets/images/event-1.jpg', 'assets/images/event-2.jpg', 'assets/images/event-3.jpg'],
};

export default {
    title: 'Events|Details',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

const Container = styled.div`
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
`;

const BgContainer = styled.div`
    background-color: #1b1726;
    margin-bottom: 24px;
`;

const toggleAll = () => {
    store.set({
        showAll: !store.get('showAll'),
    });
};

const store = new Store({
    label: 'Read more',
    showText: false,
    showAll: false,
    showCta: false,
});

const slides = [
    {
        id: 1,
        name: 'Matt Houlonski Houlonski',
        date: 'Mon, Feb 16 8:30PM',
        url: 'assets/images/slide-1.jpg',
    },
    {
        id: 2,
        name: 'Matt Houlonski',
        date: 'Mon, Feb 16 8:30PM',
        url: 'assets/images/slide-2.jpg',
    },
    {
        id: 3,
        name: 'Matt Houlonski',
        date: 'Mon, Feb 16 8:30PM',
        url: 'assets/images/slide-1.jpg',
    },
];

const onChange = (isVisible: boolean) => {
    store.set({
        showCta: isVisible ? false : true,
    });
};

export const showcase = () => (
    <State store={store}>
        {(state) => [
            <div>
                <Container>
                    <Gradient values={eventDetails.gradients} blurOnly />
                    <EventHeader
                        event={eventDetails}
                        subtitle={'Tickets from 12 $'}
                        buttonTitle={'Get Tickets'}
                        onChange={onChange}
                        onClick={action('clicked')}
                    />
                    <BgContainer>
                        <DateTimeCard
                            iconColor={eventDetails.mainColor}
                            endDate={eventDetails.endDate}
                            endTime={eventDetails.endTime}
                            startDate={eventDetails.startDate}
                            startTime={eventDetails.startTime}
                            removeBg
                        />
                        <LocationCard
                            address={eventDetails.location}
                            subtitle={'Get directions'}
                            iconColor={eventDetails.mainColor}
                            location={eventDetails.location}
                            removeBg
                        />
                        <Border />
                        <ReadMore
                            readMoreColor={eventDetails.mainColor}
                            title={'About'}
                            text={eventDetails.about}
                            showLabel={'Read more'}
                            hideLabel={'Show less'}
                            removeBg
                        />
                        <Border />
                        <PhotosVideosCard title={'Photos & videos'} photos={eventDetails.photos} removeBg />
                        <Border />
                        <TagsListCard
                            label={text('Label', 'Tags')}
                            handleToggle={toggleAll}
                            showAll={state.showAll}
                            tags={eventDetails.tags}
                            hideLabel={'Hide'}
                            removeBg
                        />
                        <Border />
                    </BgContainer>
                    <EventCarousel title={'More events'} slides={slides} />
                </Container>
                <EventCta
                    ctaLabel={'Get tickets'}
                    title={'Tickets from'}
                    onClick={action('clicked')}
                    subtitle={'From 34€ to 56€ each'}
                    gradients={eventDetails.gradients}
                    show={state.showCta}
                />
            </div>,
        ]}
    </State>
);
