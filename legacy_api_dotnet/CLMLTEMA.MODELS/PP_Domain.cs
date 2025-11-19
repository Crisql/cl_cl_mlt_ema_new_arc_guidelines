using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    //Esto modelo no se representa en la BD, Viene desde el UI
    public class PPTerminalsByUser
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public int TerminalDefaultCOL { get; set; }
        public int TerminalDefaultUSD { get; set; }
        public List<TerminalsByUser> TerminalsByUser { get; set; }
    }

    //Este modelo no se representa en la BD es solo puente para ir a la BD
    public class PPTerminalsId : IClDatabaseServices
    {
        public string UserId { get; set; }
        public string TerminalId { get; set; }
        public int TerminalDefaultCOL { get; set; }
        public int TerminalDefaultUSD { get; set; }
        public string CompanyId { get; set; }
    }

    //Modelo de respuesta para el UI
    public class PPTransactionTotal
    {
        public decimal SalesAmount { get; set; }
    }


    public class CanceledTransaction : BaseEntity
    {
        public string TransactionId { get; set; }
        public string ReferenceNumber { get; set; }
        public string AuthorizationNumber { get; set; }
        public string SystemTrace { get; set; }
        public string CreationDate { get; set; }
        public string SaleAmount { get; set; }
        public string Terminal { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }


    //No representa un modelo en la BD viene desde elUI
    public class PPBalanceRequest
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public string TerminalId { get; set; }
        public String DocumentType { get; set; }
    }

    public class CommittedTransaction
    {
        public int Id { get; set; }
        public int DocEntry { get; set; }
        public string InvoiceNumber { get; set; }
        public string ReferenceNumber { get; set; }
        public string AuthorizationNumber { get; set; }
        public string SalesAmount { get; set; }
        public string HostDate { get; set; }
        public DateTime CreationDate { get; set; }
        public int ACQ { get; set; }
        public string TransactionType { get; set; }
        public string TerminalCode { get; set; }
    }

    public class ACQTransaction
    {
        public Terminal Terminal { get; set; }
        public PPBalance OverACQ { get; set; }
        public PPBalanceRequest BalanceRequest { get; set; }
    }

    public class VoidedPresentation
    {
        public string User { get; set; }
        public DateTime CreationDate { get; set; }
        public string TerminalId { get; set; }
        public string ReferenceNumber { get; set; }
        public string AuthorizationNumber { get; set; }
        public string TransactionId { get; set; }
        public string InvoiceNumber { get; set; }
        public string SystemTrace { get; set; }
        public double SalesAmount { get; set; }
        public string SerializedTransaction { get; set; }
    }

    public class TotalTransaction
    {
        public decimal Total { get; set; }
    }
    #region REPRESENTAN TABLAS EN LA BD

    public class PPStoredTransaction : BaseEntity, IClDatabaseServices
    {
        public int Id { get; set; }
        public string StorageKey { get; set; }
        public string Data { get; set; }
        public string StateType { get; set; }
        public string TransactionType { get; set; }
        public string SyncUser { get; set; }
        public string DocumentKey { get; set; }
        public string TerminalId { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }

    public class PPCashDeskClosing : BaseEntity, IClDatabaseServices
    {
        public string TerminalId { get; set; }
        public string SerializedTransaction { get; set; }
        public string Type { get; set; }
        public int Internal { get; set; }
        public bool IsApproved { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }

    public class PPCashDeskClosingDetail : BaseEntity
    {
        public string DocumentKey { get; set; }
        public int Internal { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }

    public class PPTransaction : BaseEntity, IClDatabaseServices
    {
        public int DocEntry { get; set; }
        public string InvoiceNumber { get; set; }
        public string DocumentKey { get; set; }
        public string TerminalId { get; set; }
        public string SerializedTransaction { get; set; }
        public string TransactionId { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
       
    }

    public class PPBalance : BaseEntity, IClDatabaseServices
    {
        public string XMLDocumentResponse { get; set; }
        public string ResponseCode { get; set; }
        public string ResponseCodeDescription { get; set; }
        public string AcqNumber { get; set; }
        public string CardBrand { get; set; }
        public string HotTime { get; set; }
        public string HostDate { get; set; }
        public string RefundsAmount { get; set; }
        public string RefundsTransactions { get; set; }
        public string SalesTransactions { get; set; }
        public string SalesAmount { get; set; }
        public string SalesTax { get; set; }
        public string SalesTip { get; set; }
        public string TransactionType { get; set; }
        public string TerminalCode { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }

    public class PPVoidedTransaction : BaseEntity, IClDatabaseServices
    {
        public string InvoiceNumber { get; set; }
        public string DocumentKey { get; set; }
        public string TerminalId { get; set; }
        public string SerializedTransaction { get; set; }
        public string TransactionId { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
    }

    public class PrintPinpad 
    {
        public int DocumentKey { get; set; }
        public string RawData { get; set; }
        public bool IsACopy { get; set; }
    }
    #endregion
}