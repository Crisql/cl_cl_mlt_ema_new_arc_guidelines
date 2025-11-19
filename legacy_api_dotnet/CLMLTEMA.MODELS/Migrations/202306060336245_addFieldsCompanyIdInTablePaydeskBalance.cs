namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class addFieldsCompanyIdInTablePaydeskBalance : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PaydeskBalances", "CompanyId", c => c.Int(nullable: false));
            CreateIndex("dbo.PaydeskBalances", "CompanyId");
            AddForeignKey("dbo.PaydeskBalances", "CompanyId", "dbo.Companies", "Id", cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.PaydeskBalances", "CompanyId", "dbo.Companies");
            DropIndex("dbo.PaydeskBalances", new[] { "CompanyId" });
            DropColumn("dbo.PaydeskBalances", "CompanyId");
        }
    }
}
