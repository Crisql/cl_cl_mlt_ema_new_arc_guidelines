namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddGuideTourGroupsAndGuideTourStepsTables : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.GuideTourGroups",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Code = c.String(),
                        TourGroupName = c.String(),
                        ViewPath = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.GuideTourSteps",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GuideTourGroupId = c.Int(nullable: false),
                        ComponentSelector = c.String(),
                        StepTitle = c.String(),
                        StepText = c.String(),
                        ShowNextButton = c.Boolean(nullable: false),
                        ShowBackButton = c.Boolean(nullable: false),
                        ShowFinalizeButton = c.Boolean(nullable: false),
                        ModalPosition = c.String(),
                        HighlightClass = c.String(),
                        CssClasses = c.String(),
                        AdvanceOnSelector = c.String(),
                        AdvanceOnDOMEvent = c.String(),
                        CanClickTarget = c.Boolean(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            DropTable("dbo.GuideTours");
        }
        
        public override void Down()
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
            
            DropTable("dbo.GuideTourSteps");
            DropTable("dbo.GuideTourGroups");
        }
    }
}
