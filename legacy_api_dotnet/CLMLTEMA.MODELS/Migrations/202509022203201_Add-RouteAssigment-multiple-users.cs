namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddRouteAssigmentmultipleusers : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Routes", "RouteAssignmentId", "dbo.RouteAssignments");
            DropIndex("dbo.Routes", new[] { "RouteAssignmentId" });
            AddColumn("dbo.RouteAssignments", "RouteId", c => c.Int(nullable: false));
            CreateIndex("dbo.RouteAssignments", "RouteId");
            AddForeignKey("dbo.RouteAssignments", "RouteId", "dbo.Routes", "Id", cascadeDelete: false);
            DropColumn("dbo.Routes", "RouteAssignmentId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Routes", "RouteAssignmentId", c => c.Int());
            DropForeignKey("dbo.RouteAssignments", "RouteId", "dbo.Routes");
            DropIndex("dbo.RouteAssignments", new[] { "RouteId" });
            DropColumn("dbo.RouteAssignments", "RouteId");
            CreateIndex("dbo.Routes", "RouteAssignmentId");
            AddForeignKey("dbo.Routes", "RouteAssignmentId", "dbo.RouteAssignments", "Id");
        }
    }
}
