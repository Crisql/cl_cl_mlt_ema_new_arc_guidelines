namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddFieldsInTableSeries : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Series", "NoSerie", c => c.Int(nullable: false));
            AddColumn("dbo.Series", "DocumentType", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Series", "DocumentType");
            DropColumn("dbo.Series", "NoSerie");
        }
    }
}
