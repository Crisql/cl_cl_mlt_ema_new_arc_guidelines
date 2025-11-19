/**
 * The interface is used to map card data
 */
export interface CreditCardMobile {
    // card id
    CreditCard: number;
    // card number
    CreditCardNumber: number;
    // card expiration date
    CardValidUntil: string;
    // voucher number
    VoucherNum: string;
    // Amount to be paid with the card
    CreditSum: number;
    // Card account currency
    Currency: string;
    // Card owner
    OwnerIdNum: string;
    // SAP ledger account for the card
    CreditAcct: string;
}
