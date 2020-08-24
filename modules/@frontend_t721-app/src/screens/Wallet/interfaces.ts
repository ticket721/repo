export interface CategoryItem {
    id: string;
    name: string;
    price: string;
    purchasedDate: Date;
}

export interface DateItem {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    imageId: string;
    colors: string[];
    location: string;
}