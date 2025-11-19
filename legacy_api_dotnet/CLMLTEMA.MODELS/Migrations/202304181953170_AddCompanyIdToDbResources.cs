namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddCompanyIdToDbResources : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.DBResources", "CompanyId", c => c.Int(nullable: false));
            CreateIndex("dbo.DBResources", "CompanyId");
            AddForeignKey("dbo.DBResources", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.DBResources", "CompanyId", "dbo.Companies");
            DropIndex("dbo.DBResources", new[] { "CompanyId" });
            DropColumn("dbo.DBResources", "CompanyId");
        }
    }
}
