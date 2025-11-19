namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialTablesRelationships : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Companies",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        SapConnectionId = c.Int(nullable: false),
                        Name = c.String(),
                        DatabaseCode = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.SapConnections", t => t.SapConnectionId, cascadeDelete: true)
                .Index(t => t.SapConnectionId);
            
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
            
            CreateTable(
                "dbo.DbObjectNames",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Description = c.String(),
                        DbObject = c.String(),
                        Type = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Settings",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Code = c.String(),
                        View = c.String(),
                        Json = c.String(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.UserAssigns",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        CompanyId = c.Int(nullable: false),
                        UserId = c.Int(nullable: false),
                        SlpCode = c.String(),
                        CenterCost = c.String(),
                        WhsCode = c.String(),
                        Discount = c.Double(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.CompanyId)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.Users",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        LastName = c.String(),
                        Email = c.String(),
                        Password = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.UserAssigns", "UserId", "dbo.Users");
            DropForeignKey("dbo.UserAssigns", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.Companies", "SapConnectionId", "dbo.SapConnections");
            DropIndex("dbo.UserAssigns", new[] { "UserId" });
            DropIndex("dbo.UserAssigns", new[] { "CompanyId" });
            DropIndex("dbo.Companies", new[] { "SapConnectionId" });
            DropTable("dbo.Users");
            DropTable("dbo.UserAssigns");
            DropTable("dbo.Settings");
            DropTable("dbo.DbObjectNames");
            DropTable("dbo.SapConnections");
            DropTable("dbo.Companies");
        }
    }
}
