export class ProductApiModel {

    constructor(
        public Discount: number,
        public ItemCode: string,
        public ItemName: string,
        public TaxCode: string,
        public TaxRate: number,
    ) {
    }

}

export interface FocusItemModel {
    // identificador del item focus
    Id: number;
    // codigo del item focus
    ItemCode: string;
}
