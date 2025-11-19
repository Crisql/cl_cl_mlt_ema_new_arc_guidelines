namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddRouteAdministratorsTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.RouteAdministrators",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        RouteId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Routes", t => t.RouteId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.RouteId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.RouteAdministrators", "UserId", "dbo.Users");
            DropForeignKey("dbo.RouteAdministrators", "RouteId", "dbo.Routes");
            DropIndex("dbo.RouteAdministrators", new[] { "RouteId" });
            DropIndex("dbo.RouteAdministrators", new[] { "UserId" });
            DropTable("dbo.RouteAdministrators");
        }
    }
}
