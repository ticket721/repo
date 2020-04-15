export default interface Event {
  name: string;
  mainColor: string;
  location: string;
  address: string;
  startDate: string;
  gradients: string[];
  startTime: string;
  endDate: string;
  endTime: string;
  image: string;
  about: string;
  tags: Tag[];
  resale: boolean;
  photos?: string[];
  refundPolicy: RefundPolicy;
  hostedBy: HostProps;
}

interface RefundPolicy {
  title: string;
  description: string;
}

interface Tag {
  id: string | number;
  label: string;
}

interface HostProps {
  name: string;
  image: string;
  eventsLink?: string;
  spotifyUrl?: string;
  numberEvents?: number;
}
