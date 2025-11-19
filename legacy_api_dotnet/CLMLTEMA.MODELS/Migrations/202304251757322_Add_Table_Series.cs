namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_Table_Series : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Series",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserAssingId = c.Int(nullable: false),
                        CompanyId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: false)
                .ForeignKey("dbo.UserAssigns", t => t.UserAssingId, cascadeDelete: false)
                .Index(t => t.UserAssingId)
                .Index(t => t.CompanyId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Series", "UserAssingId", "dbo.UserAssigns");
            DropForeignKey("dbo.Series", "CompanyId", "dbo.Companies");
            DropIndex("dbo.Series", new[] { "CompanyId" });
            DropIndex("dbo.Series", new[] { "UserAssingId" });
            DropTable("dbo.Series");
        }
    }
}
