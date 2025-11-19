namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddFieldSerieDescriptionInTableSeriesByUsers : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.SeriesByUsers", "SerieDescription", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.SeriesByUsers", "SerieDescription");
        }
    }
}
