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
  tags: string[];
  resale: boolean;
  photos?: string[];
  refundPolicy: RefundPolicy;
  hostedBy: HostProps;
}

interface RefundPolicy {
  title: string;
  description: string;
}

interface HostProps {
  name: string;
  image: string;
  spotifyUrl?: string;
  numberEvents?: number;
}
