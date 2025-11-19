namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addCompanyInTablePPTransaction : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PPBalances", "CompanyId", c => c.Int(nullable: false));
            AddColumn("dbo.PPBalances", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPBalances", "CreatedBy", c => c.String());
            AddColumn("dbo.PPBalances", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.PPBalances", "UpdatedBy", c => c.String());
            AddColumn("dbo.PPBalances", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.PPCashDeskClosings", "CompanyId", c => c.Int(nullable: false));
            AddColumn("dbo.PPCashDeskClosings", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPCashDeskClosings", "CreatedBy", c => c.String());
            AddColumn("dbo.PPCashDeskClosings", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.PPCashDeskClosings", "UpdatedBy", c => c.String());
            AddColumn("dbo.PPCashDeskClosings", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.PPCashDeskClosingDetails", "CompanyId", c => c.Int(nullable: false));
            AddColumn("dbo.PPCashDeskClosingDetails", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPCashDeskClosingDetails", "CreatedBy", c => c.String());
            AddColumn("dbo.PPCashDeskClosingDetails", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.PPCashDeskClosingDetails", "UpdatedBy", c => c.String());
            AddColumn("dbo.PPCashDeskClosingDetails", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.PPStoredTransactions", "CompanyId", c => c.Int(nullable: false));
            AddColumn("dbo.PPStoredTransactions", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPStoredTransactions", "CreatedBy", c => c.String());
            AddColumn("dbo.PPStoredTransactions", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.PPStoredTransactions", "UpdatedBy", c => c.String());
            AddColumn("dbo.PPStoredTransactions", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.PPTransactions", "CompanyId", c => c.Int(nullable: false));
            AddColumn("dbo.PPTransactions", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPTransactions", "CreatedBy", c => c.String());
            AddColumn("dbo.PPTransactions", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.PPTransactions", "UpdatedBy", c => c.String());
            AddColumn("dbo.PPTransactions", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.PPVoidedTransactions", "CompanyId", c => c.Int(nullable: false));
            AddColumn("dbo.PPVoidedTransactions", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPVoidedTransactions", "CreatedBy", c => c.String());
            AddColumn("dbo.PPVoidedTransactions", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.PPVoidedTransactions", "UpdatedBy", c => c.String());
            AddColumn("dbo.PPVoidedTransactions", "IsActive", c => c.Boolean(nullable: false));
            CreateIndex("dbo.PPBalances", "CompanyId");
            CreateIndex("dbo.PPCashDeskClosings", "CompanyId");
            CreateIndex("dbo.PPCashDeskClosingDetails", "CompanyId");
            CreateIndex("dbo.PPStoredTransactions", "CompanyId");
            CreateIndex("dbo.PPTransactions", "CompanyId");
            CreateIndex("dbo.PPVoidedTransactions", "CompanyId");
            AddForeignKey("dbo.PPBalances", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
            AddForeignKey("dbo.PPCashDeskClosings", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
            AddForeignKey("dbo.PPCashDeskClosingDetails", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
            AddForeignKey("dbo.PPStoredTransactions", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
            AddForeignKey("dbo.PPTransactions", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
            AddForeignKey("dbo.PPVoidedTransactions", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
            DropColumn("dbo.PPBalances", "CreationDate");
            DropColumn("dbo.PPBalances", "ModificationDate");
            DropColumn("dbo.PPCashDeskClosings", "User");
            DropColumn("dbo.PPCashDeskClosings", "CreationDate");
            DropColumn("dbo.PPCashDeskClosingDetails", "CreationDate");
            DropColumn("dbo.PPStoredTransactions", "TransactionUser");
            DropColumn("dbo.PPTransactions", "User");
            DropColumn("dbo.PPTransactions", "CreationDate");
            DropColumn("dbo.PPVoidedTransactions", "User");
            DropColumn("dbo.PPVoidedTransactions", "CreationDate");
        }
        
        public override void Down()
        {
            AddColumn("dbo.PPVoidedTransactions", "CreationDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPVoidedTransactions", "User", c => c.String());
            AddColumn("dbo.PPTransactions", "CreationDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPTransactions", "User", c => c.String());
            AddColumn("dbo.PPStoredTransactions", "TransactionUser", c => c.String());
            AddColumn("dbo.PPCashDeskClosingDetails", "CreationDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPCashDeskClosings", "CreationDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPCashDeskClosings", "User", c => c.String());
            AddColumn("dbo.PPBalances", "ModificationDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PPBalances", "CreationDate", c => c.DateTime(nullable: false));
            DropForeignKey("dbo.PPVoidedTransactions", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.PPTransactions", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.PPStoredTransactions", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.PPCashDeskClosingDetails", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.PPCashDeskClosings", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.PPBalances", "CompanyId", "dbo.Companies");
            DropIndex("dbo.PPVoidedTransactions", new[] { "CompanyId" });
            DropIndex("dbo.PPTransactions", new[] { "CompanyId" });
            DropIndex("dbo.PPStoredTransactions", new[] { "CompanyId" });
            DropIndex("dbo.PPCashDeskClosingDetails", new[] { "CompanyId" });
            DropIndex("dbo.PPCashDeskClosings", new[] { "CompanyId" });
            DropIndex("dbo.PPBalances", new[] { "CompanyId" });
            DropColumn("dbo.PPVoidedTransactions", "IsActive");
            DropColumn("dbo.PPVoidedTransactions", "UpdatedBy");
            DropColumn("dbo.PPVoidedTransactions", "UpdateDate");
            DropColumn("dbo.PPVoidedTransactions", "CreatedBy");
            DropColumn("dbo.PPVoidedTransactions", "CreatedDate");
            DropColumn("dbo.PPVoidedTransactions", "CompanyId");
            DropColumn("dbo.PPTransactions", "IsActive");
            DropColumn("dbo.PPTransactions", "UpdatedBy");
            DropColumn("dbo.PPTransactions", "UpdateDate");
            DropColumn("dbo.PPTransactions", "CreatedBy");
            DropColumn("dbo.PPTransactions", "CreatedDate");
            DropColumn("dbo.PPTransactions", "CompanyId");
            DropColumn("dbo.PPStoredTransactions", "IsActive");
            DropColumn("dbo.PPStoredTransactions", "UpdatedBy");
            DropColumn("dbo.PPStoredTransactions", "UpdateDate");
            DropColumn("dbo.PPStoredTransactions", "CreatedBy");
            DropColumn("dbo.PPStoredTransactions", "CreatedDate");
            DropColumn("dbo.PPStoredTransactions", "CompanyId");
            DropColumn("dbo.PPCashDeskClosingDetails", "IsActive");
            DropColumn("dbo.PPCashDeskClosingDetails", "UpdatedBy");
            DropColumn("dbo.PPCashDeskClosingDetails", "UpdateDate");
            DropColumn("dbo.PPCashDeskClosingDetails", "CreatedBy");
            DropColumn("dbo.PPCashDeskClosingDetails", "CreatedDate");
            DropColumn("dbo.PPCashDeskClosingDetails", "CompanyId");
            DropColumn("dbo.PPCashDeskClosings", "IsActive");
            DropColumn("dbo.PPCashDeskClosings", "UpdatedBy");
            DropColumn("dbo.PPCashDeskClosings", "UpdateDate");
            DropColumn("dbo.PPCashDeskClosings", "CreatedBy");
            DropColumn("dbo.PPCashDeskClosings", "CreatedDate");
            DropColumn("dbo.PPCashDeskClosings", "CompanyId");
            DropColumn("dbo.PPBalances", "IsActive");
            DropColumn("dbo.PPBalances", "UpdatedBy");
            DropColumn("dbo.PPBalances", "UpdateDate");
            DropColumn("dbo.PPBalances", "CreatedBy");
            DropColumn("dbo.PPBalances", "CreatedDate");
            DropColumn("dbo.PPBalances", "CompanyId");
        }
    }
}
