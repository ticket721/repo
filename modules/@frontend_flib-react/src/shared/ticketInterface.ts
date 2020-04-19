export default interface Ticket {
  name: string;
  mainColor: string;
  location: string;
  address: string;
  number: number;
  ticketType: string;
  startDate: string;
  gradients: string[];
  startTime: string;
  endDate: string;
  endTime: string;
  ticketId: string;
  addOns: number;
  image: string;
  seat?: SeatProps,
  purchase_date?: string;
  price?: string;
}

interface SeatProps {
  block: string;
  row: string;
  number: string | number;
}
