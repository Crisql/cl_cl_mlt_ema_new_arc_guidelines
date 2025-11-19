namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeTypeFieldDocumentType : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.SeriesByUsers", "DocumentType", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.SeriesByUsers", "DocumentType", c => c.Int(nullable: false));
        }
    }
}
