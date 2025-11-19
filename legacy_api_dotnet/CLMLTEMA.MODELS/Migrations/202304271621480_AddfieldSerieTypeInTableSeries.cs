namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddfieldSerieTypeInTableSeries : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Series", "SerieType", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Series", "SerieType");
        }
    }
}
