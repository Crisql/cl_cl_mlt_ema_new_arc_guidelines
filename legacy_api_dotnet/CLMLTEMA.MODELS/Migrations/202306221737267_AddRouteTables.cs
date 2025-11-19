namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddRouteTables : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.RouteAssignments",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        RouteDownloadDate = c.DateTime(),
                        IMEI = c.String(),
                        UserAssignId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.UserAssigns", t => t.UserAssignId, cascadeDelete: true)
                .Index(t => t.UserAssignId);
            
            CreateTable(
                "dbo.RouteCalculationDetails",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Type = c.Int(nullable: false),
                        Distance = c.Single(nullable: false),
                        Duration = c.Single(nullable: false),
                        JsonApi = c.String(),
                        Status = c.Int(nullable: false),
                        RouteId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Routes", t => t.RouteId, cascadeDelete: true)
                .Index(t => t.RouteId);
            
            CreateTable(
                "dbo.Routes",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        ExpirationDate = c.DateTime(nullable: false),
                        Status = c.Int(nullable: false),
                        Type = c.Int(nullable: false),
                        ActivationDate = c.DateTime(),
                        TotalDistance = c.Single(nullable: false),
                        TotalDuration = c.Single(nullable: false),
                        CloseDetail = c.String(),
                        CloseUser = c.String(),
                        CloseDate = c.DateTime(),
                        TotalEstimatedDistance = c.Single(nullable: false),
                        TotalEstimatedDuration = c.Single(nullable: false),
                        CompanyId = c.Int(nullable: false),
                        RouteFrequencyId = c.Int(nullable: false),
                        RouteAssignmentId = c.Int(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
                .ForeignKey("dbo.RouteAssignments", t => t.RouteAssignmentId)
                .ForeignKey("dbo.RouteFrequencies", t => t.RouteFrequencyId, cascadeDelete: true)
                .Index(t => t.CompanyId)
                .Index(t => t.RouteFrequencyId)
                .Index(t => t.RouteAssignmentId);
            
            CreateTable(
                "dbo.RouteFrequencies",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Description = c.String(),
                        Weeks = c.String(),
                        Days = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.RouteHistories",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        CheckType = c.Int(nullable: false),
                        Comments = c.String(),
                        CardCode = c.String(),
                        CardName = c.String(),
                        Address = c.String(),
                        AddressType = c.Int(nullable: false),
                        Photos = c.String(),
                        RouteLineId = c.Int(),
                        RouteId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Routes", t => t.RouteId, cascadeDelete: true)
                .ForeignKey("dbo.RouteLines", t => t.RouteLineId)
                .Index(t => t.RouteLineId)
                .Index(t => t.RouteId);
            
            CreateTable(
                "dbo.RouteLines",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Address = c.String(),
                        Latitude = c.Double(nullable: false),
                        Longitude = c.Double(nullable: false),
                        CardCode = c.String(),
                        CardName = c.String(),
                        AddressLineId = c.Int(),
                        CheckStatus = c.Int(nullable: false),
                        Status = c.Int(nullable: false),
                        AddressType = c.Int(nullable: false),
                        VisitingTime = c.String(),
                        VisitEndTime = c.String(),
                        AddressLineNum = c.Int(nullable: false),
                        RouteId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Routes", t => t.RouteId, cascadeDelete: true)
                .Index(t => t.RouteId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.RouteHistories", "RouteLineId", "dbo.RouteLines");
            DropForeignKey("dbo.RouteLines", "RouteId", "dbo.Routes");
            DropForeignKey("dbo.RouteHistories", "RouteId", "dbo.Routes");
            DropForeignKey("dbo.RouteCalculationDetails", "RouteId", "dbo.Routes");
            DropForeignKey("dbo.Routes", "RouteFrequencyId", "dbo.RouteFrequencies");
            DropForeignKey("dbo.Routes", "RouteAssignmentId", "dbo.RouteAssignments");
            DropForeignKey("dbo.Routes", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.RouteAssignments", "UserAssignId", "dbo.UserAssigns");
            DropIndex("dbo.RouteLines", new[] { "RouteId" });
            DropIndex("dbo.RouteHistories", new[] { "RouteId" });
            DropIndex("dbo.RouteHistories", new[] { "RouteLineId" });
            DropIndex("dbo.Routes", new[] { "RouteAssignmentId" });
            DropIndex("dbo.Routes", new[] { "RouteFrequencyId" });
            DropIndex("dbo.Routes", new[] { "CompanyId" });
            DropIndex("dbo.RouteCalculationDetails", new[] { "RouteId" });
            DropIndex("dbo.RouteAssignments", new[] { "UserAssignId" });
            DropTable("dbo.RouteLines");
            DropTable("dbo.RouteHistories");
            DropTable("dbo.RouteFrequencies");
            DropTable("dbo.Routes");
            DropTable("dbo.RouteCalculationDetails");
            DropTable("dbo.RouteAssignments");
        }
    }
}
