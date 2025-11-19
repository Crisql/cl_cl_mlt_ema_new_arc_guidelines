namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ADD_SELLER_AND_BUYER_CODE_FIELDS : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.UserAssigns", "SellerCode", c => c.String());
            AddColumn("dbo.UserAssigns", "BuyerCode", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.UserAssigns", "BuyerCode");
            DropColumn("dbo.UserAssigns", "SellerCode");
        }
    }
}
