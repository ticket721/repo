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
    tags: Tag[];
    resale: boolean;
    photos?: string[];
}

interface Tag {
    id: string | number;
    label: string;
}
