namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addTable_PaydeskBalances : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.PaydeskBalances",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.String(),
                        UserSignature = c.String(),
                        CashAmount = c.Decimal(nullable: false, precision: 18, scale: 2),
                        CardAmount = c.Decimal(nullable: false, precision: 18, scale: 2),
                        TransferAmount = c.Decimal(nullable: false, precision: 18, scale: 2),
                        CashflowIncomme = c.Decimal(nullable: false, precision: 18, scale: 2),
                        CashflowEgress = c.Decimal(nullable: false, precision: 18, scale: 2),
                        CardAmountPinpadCOL = c.Decimal(nullable: false, precision: 18, scale: 2),
                        CardAmountPinpadUSD = c.Decimal(nullable: false, precision: 18, scale: 2),
                        ExchangeRate = c.Decimal(nullable: false, precision: 18, scale: 2),
                        UrlReport = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.PaydeskBalances");
        }
    }
}
