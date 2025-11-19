namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddCalendarAppointmentsTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CalendarAppointments",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        AppointmentId = c.String(),
                        Domain = c.Int(nullable: false),
                        Status = c.Int(nullable: false),
                        RouteLineId = c.Int(nullable: false),
                        RouteAssignmentId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.RouteAssignments", t => t.RouteAssignmentId, cascadeDelete: false)
                .ForeignKey("dbo.RouteLines", t => t.RouteLineId, cascadeDelete: false)
                .Index(t => t.RouteLineId)
                .Index(t => t.RouteAssignmentId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.CalendarAppointments", "RouteLineId", "dbo.RouteLines");
            DropForeignKey("dbo.CalendarAppointments", "RouteAssignmentId", "dbo.RouteAssignments");
            DropIndex("dbo.CalendarAppointments", new[] { "RouteAssignmentId" });
            DropIndex("dbo.CalendarAppointments", new[] { "RouteLineId" });
            DropTable("dbo.CalendarAppointments");
        }
    }
}
