namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddTablesForPPDomain : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.PPBalances",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        XMLDocumentResponse = c.String(),
                        ResponseCode = c.String(),
                        ResponseCodeDescription = c.String(),
                        AcqNumber = c.String(),
                        CardBrand = c.String(),
                        HotTime = c.String(),
                        HostDate = c.String(),
                        RefundsAmount = c.String(),
                        RefundsTransactions = c.String(),
                        SalesTransactions = c.String(),
                        SalesAmount = c.String(),
                        SalesTax = c.String(),
                        SalesTip = c.String(),
                        CreationDate = c.DateTime(nullable: false),
                        ModificationDate = c.DateTime(nullable: false),
                        TransactionType = c.String(),
                        TerminalCode = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PPCashDeskClosings",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        TerminalId = c.String(),
                        User = c.String(),
                        CreationDate = c.DateTime(nullable: false),
                        SerializedTransaction = c.String(),
                        Type = c.String(),
                        Internal = c.Int(nullable: false),
                        IsApproved = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PPCashDeskClosingDetails",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DocumentKey = c.String(),
                        Internal = c.Int(nullable: false),
                        CreationDate = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PPStoredTransactions",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        StorageKey = c.String(),
                        Data = c.String(),
                        StateType = c.String(),
                        TransactionUser = c.String(),
                        SyncUser = c.String(),
                        CreationDate = c.DateTime(nullable: false),
                        DocumentKey = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PPTransactions",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DocEntry = c.Int(nullable: false),
                        InvoiceNumber = c.String(),
                        DocumentKey = c.String(),
                        User = c.String(),
                        TerminalId = c.String(),
                        CreationDate = c.DateTime(nullable: false),
                        SerializedTransaction = c.String(),
                        TransactionId = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PPVoidedTransactions",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        InvoiceNumber = c.String(),
                        DocumentKey = c.String(),
                        TerminalId = c.String(),
                        User = c.String(),
                        SerializedTransaction = c.String(),
                        TransactionId = c.String(),
                        CreationDate = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.PPVoidedTransactions");
            DropTable("dbo.PPTransactions");
            DropTable("dbo.PPStoredTransactions");
            DropTable("dbo.PPCashDeskClosingDetails");
            DropTable("dbo.PPCashDeskClosings");
            DropTable("dbo.PPBalances");
        }
    }
}
