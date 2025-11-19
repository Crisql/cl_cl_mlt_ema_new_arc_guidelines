import { MobilePayment } from "./Doc-model";

// export class IncommingPaymentModel {

//     constructor(
//         public Currency: string,
//         public CardCode: string,
//         public CashSum: number,
//     ) {
//     }
// }

export interface IncommingPaymentModel {
    Payment: MobilePayment;
    Comment: string;
}