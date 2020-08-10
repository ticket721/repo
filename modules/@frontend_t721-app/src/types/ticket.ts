export interface Ticket {
    name: string;
    ticketId: string;
    categoryId: string;
    entityId: string;
    ticketType: 'date' | 'global';
    location: string;
    categoryName: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    gradients: string[];
    mainColor: string;
    image: string;
}
