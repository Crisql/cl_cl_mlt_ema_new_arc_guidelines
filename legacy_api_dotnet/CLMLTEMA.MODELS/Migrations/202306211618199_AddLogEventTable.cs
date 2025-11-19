namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddLogEventTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.LogEvents",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Event = c.String(),
                        View = c.String(),
                        Detail = c.String(),
                        DocumentKey = c.String(),
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
            DropTable("dbo.LogEvents");
        }
    }
}
