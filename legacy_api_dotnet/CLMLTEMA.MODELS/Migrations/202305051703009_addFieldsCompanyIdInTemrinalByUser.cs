namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addFieldsCompanyIdInTemrinalByUser : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.TerminalsByUsers", "CompanyId", c => c.Int(nullable: false));
            CreateIndex("dbo.TerminalsByUsers", "CompanyId");
            AddForeignKey("dbo.TerminalsByUsers", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.TerminalsByUsers", "CompanyId", "dbo.Companies");
            DropIndex("dbo.TerminalsByUsers", new[] { "CompanyId" });
            DropColumn("dbo.TerminalsByUsers", "CompanyId");
        }
    }
}
