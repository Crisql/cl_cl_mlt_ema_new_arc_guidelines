namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_ConnectionIdColumnInCompanies : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Companies", "ConnectionId", c => c.Int(nullable: false));
            CreateIndex("dbo.Companies", "ConnectionId");
            AddForeignKey("dbo.Companies", "ConnectionId", "dbo.Connections", "Id", cascadeDelete: true);
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Companies", "ConnectionId", "dbo.Connections");
            DropIndex("dbo.Companies", new[] { "ConnectionId" });
            DropColumn("dbo.Companies", "ConnectionId");
        }
    }
}
