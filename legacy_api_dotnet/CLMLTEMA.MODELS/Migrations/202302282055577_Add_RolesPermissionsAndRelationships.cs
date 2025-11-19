namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_RolesPermissionsAndRelationships : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Permissions",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Description = c.String(),
                        PermissionType = c.Int(nullable: false),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.PermsByRoles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        PermissionId = c.Int(nullable: false),
                        RoleId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Permissions", t => t.PermissionId, cascadeDelete: true)
                .ForeignKey("dbo.Roles", t => t.RoleId, cascadeDelete: true)
                .Index(t => t.PermissionId)
                .Index(t => t.RoleId);
            
            CreateTable(
                "dbo.Roles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Description = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.RolesByUsers",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        CompanyId = c.Int(nullable: false),
                        RoleId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
                .ForeignKey("dbo.Roles", t => t.RoleId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.CompanyId)
                .Index(t => t.RoleId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.RolesByUsers", "UserId", "dbo.Users");
            DropForeignKey("dbo.RolesByUsers", "RoleId", "dbo.Roles");
            DropForeignKey("dbo.RolesByUsers", "CompanyId", "dbo.Companies");
            DropForeignKey("dbo.PermsByRoles", "RoleId", "dbo.Roles");
            DropForeignKey("dbo.PermsByRoles", "PermissionId", "dbo.Permissions");
            DropIndex("dbo.RolesByUsers", new[] { "RoleId" });
            DropIndex("dbo.RolesByUsers", new[] { "CompanyId" });
            DropIndex("dbo.RolesByUsers", new[] { "UserId" });
            DropIndex("dbo.PermsByRoles", new[] { "RoleId" });
            DropIndex("dbo.PermsByRoles", new[] { "PermissionId" });
            DropTable("dbo.RolesByUsers");
            DropTable("dbo.Roles");
            DropTable("dbo.PermsByRoles");
            DropTable("dbo.Permissions");
        }
    }
}
