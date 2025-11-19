namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_TerminalAndTerminalsByUsersTables : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Terminals",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        TerminalCode = c.String(),
                        Description = c.String(),
                        Status = c.String(),
                        Currency = c.String(),
                        QuickPayAmount = c.Double(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.TerminalsByUsers",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        TerminalId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Terminals", t => t.TerminalId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.TerminalId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.TerminalsByUsers", "UserId", "dbo.Users");
            DropForeignKey("dbo.TerminalsByUsers", "TerminalId", "dbo.Terminals");
            DropIndex("dbo.TerminalsByUsers", new[] { "TerminalId" });
            DropIndex("dbo.TerminalsByUsers", new[] { "UserId" });
            DropTable("dbo.TerminalsByUsers");
            DropTable("dbo.Terminals");
        }
    }
}
