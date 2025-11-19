namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_GeoRolesAndGeoConfigTables : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.GeoConfigs",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Key = c.Int(nullable: false),
                        Name = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.GeoConfigByGeoRoles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        GeoConfigId = c.Int(nullable: false),
                        GeoRoleId = c.Int(nullable: false),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.GeoConfigs", t => t.GeoConfigId, cascadeDelete: true)
                .ForeignKey("dbo.GeoRoles", t => t.GeoRoleId, cascadeDelete: true)
                .Index(t => t.GeoConfigId)
                .Index(t => t.GeoRoleId);
            
            CreateTable(
                "dbo.GeoRoles",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        CreatedDate = c.DateTime(nullable: false),
                        CreatedBy = c.String(),
                        UpdateDate = c.DateTime(),
                        UpdatedBy = c.String(),
                        IsActive = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            AddColumn("dbo.UserAssigns", "GeoRoleId", c => c.Int());
            CreateIndex("dbo.UserAssigns", "GeoRoleId");
            AddForeignKey("dbo.UserAssigns", "GeoRoleId", "dbo.GeoRoles", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.UserAssigns", "GeoRoleId", "dbo.GeoRoles");
            DropForeignKey("dbo.GeoConfigByGeoRoles", "GeoRoleId", "dbo.GeoRoles");
            DropForeignKey("dbo.GeoConfigByGeoRoles", "GeoConfigId", "dbo.GeoConfigs");
            DropIndex("dbo.UserAssigns", new[] { "GeoRoleId" });
            DropIndex("dbo.GeoConfigByGeoRoles", new[] { "GeoRoleId" });
            DropIndex("dbo.GeoConfigByGeoRoles", new[] { "GeoConfigId" });
            DropColumn("dbo.UserAssigns", "GeoRoleId");
            DropTable("dbo.GeoRoles");
            DropTable("dbo.GeoConfigByGeoRoles");
            DropTable("dbo.GeoConfigs");
        }
    }
}
