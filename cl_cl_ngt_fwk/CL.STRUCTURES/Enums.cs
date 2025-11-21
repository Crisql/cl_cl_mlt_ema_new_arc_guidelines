using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CL.STRUCTURES
{
    public enum EmailDomains
    {
        Outlook = 1,
        Gmail = 2
    }

    public enum DaysOfWeek
    {
        Su = 0,
        Mo = 1,
        Tu = 2,
        We = 3,
        Tj = 4,
        Fr = 5,
        Sa = 6
    }

    public enum UdfType
    {
        Numeric = 1,
        Alpha,
        MultipleOption,
        Date,
        Decimal
    }

    public enum ObjectStatus
    {
        Stashed,
        Processing,
        Error,
        Commited,
        Success
    }

    /// <summary>
    /// We have used the standard codes provided by Sap B1
    /// </summary>
    public enum ObjectTypes
    {
        BusinessPartner = 2,
        Items = 4,
        PriceLists = 6,
        ARInvoice = 13,
        ARCreditMemo = 14,
        Delivery = 15,
        SalesOrder = 17,
        APInvoice = 18,
        APCreditMemo = 19,
        GoodsReceiptPO = 20,
        GoodsReturn = 21,
        PurchaseOrder = 22,
        SalesQuotation = 23,
        IncomingPayment = 24,
        GoodsReceipt = 59,
        GoodsIssue = 60,
        Drafts = 112,
        ARDownPayment = 203,
        APDownPayment = 204,
        CreditMemo = 1470000060,
        BarCodeMasterData = 1470000062,
        ARInvoicePlusPayment = 641 // Unused code
    }

    public enum PermissionType
    {
        Create,
        Read,
        Update,
        Delete
    }


    /// <summary>
    /// Used to give tabs in logManager
    /// </summary>
    public enum TabLevel
    {
        One = 1,
        Two = 2,
        Three = 3,
        Four = 4
    }

    public enum VERBS
    {
        POST,
        PATCH,
        GET
    }

    public static class HttpContextItems
    {
        public static readonly string CompanyKey = "COMPANY_KEY";
    }
}
