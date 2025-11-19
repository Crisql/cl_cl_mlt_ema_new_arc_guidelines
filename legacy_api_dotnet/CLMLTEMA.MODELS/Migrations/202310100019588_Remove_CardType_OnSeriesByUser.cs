namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Remove_CardType_OnSeriesByUser : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.SeriesByUsers", "CardType");
        }
        
        public override void Down()
        {
            AddColumn("dbo.SeriesByUsers", "CardType", c => c.Int(nullable: false));
        }
    }
}
