export interface Events {
  id: string;
  name: string;
  dates: {
    name?: string;
    description?: string;
    avatar?: string;
    id: string;
    price: string;
    seats: string;
    type: string;
    startDate?: string;
    endDate?: string;
    salesStart: string;
    salesEnd: string;
    resalesStart: string;
    resalesEnd: string;
    categoryName: string;
    signature_colors: string[];
    tags: string[];
    location: {
      assigned_city: number,
      location: { lon: string, lat: string },
      location_label: string,
    };
  }[];
}
