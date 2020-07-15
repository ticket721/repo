export interface GuestInfos {
    address: string;
    username: string;
    email: string;
    ticket: string;
    category: string;
}

export class EventsGuestlistResponseDto {
    guests: GuestInfos[];
}
