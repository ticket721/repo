interface GuestInfos {
    address: string;
    username: string;
    email: string;
    global: boolean;
}

export class EventsGuestlistResponseDto {
    guests: GuestInfos[];
}
