namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class CrtTableResourceByCompanies : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.DBResources", "CompanyId", "dbo.Companies");
            DropIndex("dbo.DBResources", new[] { "CompanyId" });
            CreateTable(
                "dbo.ResourcesByCompanies",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        DBResourceId = c.Int(nullable: false),
                        CompanyId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
                .ForeignKey("dbo.DBResources", t => t.DBResourceId, cascadeDelete: true)
                .Index(t => t.DBResourceId)
                .Index(t => t.CompanyId);
            
            DropColumn("dbo.DBResources", "CompanyId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.DBResources", "CompanyId", c => c.Int(nullable: false));
            DropForeignKey("dbo.ResourcesByCompanies", "DBResourceId", "dbo.DBResources");
            DropForeignKey("dbo.ResourcesByCompanies", "CompanyId", "dbo.Companies");
            DropIndex("dbo.ResourcesByCompanies", new[] { "CompanyId" });
            DropIndex("dbo.ResourcesByCompanies", new[] { "DBResourceId" });
            DropTable("dbo.ResourcesByCompanies");
            CreateIndex("dbo.DBResources", "CompanyId");
            AddForeignKey("dbo.DBResources", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
        }
    }
}
