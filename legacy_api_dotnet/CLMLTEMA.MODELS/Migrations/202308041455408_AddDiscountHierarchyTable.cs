namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddDiscountHierarchyTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.DiscountHierarchies",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Type = c.Int(nullable: false),
                        Hierarchy = c.Int(nullable: false),
                        Description = c.Int(nullable: false),
                        CompanyId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
                .Index(t => t.CompanyId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.DiscountHierarchies", "CompanyId", "dbo.Companies");
            DropIndex("dbo.DiscountHierarchies", new[] { "CompanyId" });
            DropTable("dbo.DiscountHierarchies");
        }
    }
}
