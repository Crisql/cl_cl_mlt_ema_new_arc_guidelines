namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddTableSeriesByUsers_and_DeleteTableSeries : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.Series", newName: "SeriesByUsers");
            AddColumn("dbo.SeriesByUsers", "IsSerial", c => c.Boolean(nullable: false));
            DropColumn("dbo.SeriesByUsers", "IsActive");
        }
        
        public override void Down()
        {
            AddColumn("dbo.SeriesByUsers", "IsActive", c => c.Boolean(nullable: false));
            DropColumn("dbo.SeriesByUsers", "IsSerial");
            RenameTable(name: "dbo.SeriesByUsers", newName: "Series");
        }
    }
}
