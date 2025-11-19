namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class DeleteFiledsInTablePaydeskBalances : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PaydeskBalances", "CardAmountPinpad", c => c.Decimal(nullable: false, precision: 18, scale: 2));
            AddColumn("dbo.PaydeskBalances", "Terminal", c => c.String());
            DropColumn("dbo.PaydeskBalances", "CardAmountPinpadCOL");
            DropColumn("dbo.PaydeskBalances", "CardAmountPinpadUSD");
        }
        
        public override void Down()
        {
            AddColumn("dbo.PaydeskBalances", "CardAmountPinpadUSD", c => c.Decimal(nullable: false, precision: 18, scale: 2));
            AddColumn("dbo.PaydeskBalances", "CardAmountPinpadCOL", c => c.Decimal(nullable: false, precision: 18, scale: 2));
            DropColumn("dbo.PaydeskBalances", "Terminal");
            DropColumn("dbo.PaydeskBalances", "CardAmountPinpad");
        }
    }
}
