namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_GuideTourTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.GuideTours",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RouteView = c.String(),
                        SelectorId = c.String(),
                        Steps = c.String(),
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
            DropTable("dbo.GuideTours");
        }
    }
}
