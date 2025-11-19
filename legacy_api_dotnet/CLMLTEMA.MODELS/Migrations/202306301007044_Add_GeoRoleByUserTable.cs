namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_GeoRoleByUserTable : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.GeoRoleByUsers",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        CompanyId = c.Int(nullable: false),
                        GeoRoleId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Companies", t => t.CompanyId, cascadeDelete: true)
                .ForeignKey("dbo.GeoRoles", t => t.GeoRoleId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.UserId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.CompanyId)
                .Index(t => t.GeoRoleId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.GeoRoleByUsers", "UserId", "dbo.Users");
            DropForeignKey("dbo.GeoRoleByUsers", "GeoRoleId", "dbo.GeoRoles");
            DropForeignKey("dbo.GeoRoleByUsers", "CompanyId", "dbo.Companies");
            DropIndex("dbo.GeoRoleByUsers", new[] { "GeoRoleId" });
            DropIndex("dbo.GeoRoleByUsers", new[] { "CompanyId" });
            DropIndex("dbo.GeoRoleByUsers", new[] { "UserId" });
            DropTable("dbo.GeoRoleByUsers");
        }
    }
}
