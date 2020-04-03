export default interface Ticket {
  name: string;
  mainColor: string;
  location: string;
  address: string;
  number: number;
  ticketType: string;
  startDate: string;
  gradients?: Array<string>;
  startTime: string;
  endDate: string;
  endTime: string;
  addOns: number;
  image: string;
}
