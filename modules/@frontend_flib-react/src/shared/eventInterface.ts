export default interface Event {
    name: string;
    mainColor: string;
    location: string;
    startDate: string;
    gradients: string[];
    startTime: string;
    endDate: string;
    endTime: string;
    image: string;
    about: string;
    resale: boolean;
    photos?: string[];
}
