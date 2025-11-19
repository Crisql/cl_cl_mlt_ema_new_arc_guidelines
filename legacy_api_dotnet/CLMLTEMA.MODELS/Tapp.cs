using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;

namespace CLMLTEMA.MODELS
{
    public class TappConfigBase
    {
        public string Url { get; set; }
        public List<TappConfig> TappConfigs { get; set; }
    }

    public class TappConfig
    {
        public int CompanyId { get; set; }
        public bool Active { get; set; }
        public string Token { get; set; }
        public string Register { get; set; }
        public string Store { get; set; }
        public PlanCard Card { get; set; }
    }

    public class TappCloseInvoice
    {
        public string register_id { get; set; }
        public string store_id { get; set; }
        public string tapp_bridge_id { get; set; }
        public string invoice_id { get; set; }
        public string invoiceDate { get; set; }
        public string pos_user_id { get; set; }
        public decimal invoice_amount { get; set; }
        public decimal redeemed_points { get; set; }
        public List<ProductsTapp> products { get; set; }
        public List<int> rewards_given { get; set; }
    }

    public class ProductsTapp
    {
        public string product_code { get; set; }
        public string product_description { get; set; }
        public decimal quantity { get; set; }
        public decimal subtotal { get; set; }
    }
    
    public class TappResponse
    {
        public object pos_process { get; set; }
        public object pos_session { get; set; }
        public string message { get; set; }
        public int error_code { get; set; }
        public int tapp_customer_points { get; set; }
        public int tapp_given_points { get; set; }
    }
    
    public class ARInvoiceTapp
    {
        [MasterKey]
        public int DocEntry { get; set; }
        public int U_EMA_withTransactionTapp { get; set; }
    } 
    
    public class CreditNoteTapp
    {
        public string register_id { get; set; }
        public string invoice_id { get; set; }
        public decimal amount { get; set; }
        public string credit_note_id { get; set; }
        public string tapp_bridge_id { get; set; }
        public List<CreditNoteLinesTapp> products { get; set; }
    }
    
    public class CreditNoteLinesTapp
    {
        public string product_code { get; set; }
        public string product_description { get; set; }
        public decimal quantity { get; set; }
        public decimal subtotal { get; set; }
    }
    
    public class ErrorTapp
    {
        public string message { get; set; }
        public int code { get; set; }
    }

    public class ResponseCreditNoteTapp
    {
        public string _status { get; set; }
        public ErrorTapp _error { get; set; }
    }
}