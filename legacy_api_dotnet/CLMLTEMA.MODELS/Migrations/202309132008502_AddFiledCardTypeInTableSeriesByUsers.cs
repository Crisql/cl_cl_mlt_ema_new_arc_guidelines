namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddFiledCardTypeInTableSeriesByUsers : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SeriesByUsers", "CardType", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.SeriesByUsers", "CardType");
        }
    }
}
