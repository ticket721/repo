export interface Events {
  group_id: string;
  name: string;
  dates: {
    name: string;
    avatar: string;
    id: string;
    location: string,
    colors: string[],
    startDate: string,
    endDate: string,
    categories: Category[]
  }[];
  categories: Category[];
}

export interface Category {
  id: string;
  prices: Price[];
  name: string;

}

interface Price {
  currency: string;
  log_value: number;
  value: string;
}
