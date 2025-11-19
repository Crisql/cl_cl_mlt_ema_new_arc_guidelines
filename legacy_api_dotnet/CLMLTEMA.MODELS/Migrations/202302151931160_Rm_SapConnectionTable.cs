namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Rm_SapConnectionTable : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Companies", "SapConnectionId", "dbo.SapConnections");
            DropIndex("dbo.Companies", new[] { "SapConnectionId" });
            DropColumn("dbo.Companies", "SapConnectionId");
            DropTable("dbo.SapConnections");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.SapConnections",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Odbctype = c.String(),
                        Server = c.String(),
                        User = c.String(),
                        Pass = c.String(),
                        ServerType = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            AddColumn("dbo.Companies", "SapConnectionId", c => c.Int(nullable: false));
            CreateIndex("dbo.Companies", "SapConnectionId");
            AddForeignKey("dbo.Companies", "SapConnectionId", "dbo.SapConnections", "Id", cascadeDelete: true);
        }
    }
}
