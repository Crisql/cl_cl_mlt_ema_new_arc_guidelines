namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Remove_GeoRoleOnUserAssign : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.UserAssigns", "GeoRoleId", "dbo.GeoRoles");
            DropIndex("dbo.UserAssigns", new[] { "GeoRoleId" });
            DropColumn("dbo.UserAssigns", "GeoRoleId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.UserAssigns", "GeoRoleId", c => c.Int());
            CreateIndex("dbo.UserAssigns", "GeoRoleId");
            AddForeignKey("dbo.UserAssigns", "GeoRoleId", "dbo.GeoRoles", "Id");
        }
    }
}
