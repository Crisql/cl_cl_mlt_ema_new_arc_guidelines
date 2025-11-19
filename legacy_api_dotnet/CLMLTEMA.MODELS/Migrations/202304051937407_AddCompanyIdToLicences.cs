namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddCompanyIdToLicences : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Licenses", "CompanyId", c => c.Int(nullable: false));
            CreateIndex("dbo.Licenses", "CompanyId");
            AddForeignKey("dbo.Licenses", "CompanyId", "dbo.Companies", "Id", cascadeDelete: false);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Licenses", "CompanyId", "dbo.Companies");
            DropIndex("dbo.Licenses", new[] { "CompanyId" });
            DropColumn("dbo.Licenses", "CompanyId");
        }
    }
}
