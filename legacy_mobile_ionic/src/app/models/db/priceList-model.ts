// export class PriceListModel {
//
//     constructor(
//         public ItemCode: string,
//         public Price: number,
//         public PriceList: number,
//         public id: number,
//         public Currency: string,
//         public UomEntry: number
//     ) {
//     }
//
// }

export interface IProductPrice
{
     ItemCode: string;
     Price: number;
     PriceList: number;
     id: number;
     Currency: string;
     UomEntry: number;
}