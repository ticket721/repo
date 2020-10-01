export interface Product {
    type: string;
    id: string;
    quantity: number;
}

export interface Payment {
    type: string;
    id: string;
    status: string;
}

export interface Purchase {
    products: Product[];
    payment: Payment;
    created_at: Date;
    closed_at: Date;
    payment_interface: string;
    price: number;
    currency: string;
}
