namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddBaseEntityPropsToRolsByUserAndPermsByRol : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.PermsByRoles", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.PermsByRoles", "CreatedBy", c => c.String());
            AddColumn("dbo.PermsByRoles", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.PermsByRoles", "UpdatedBy", c => c.String());
            AddColumn("dbo.PermsByRoles", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.RolesByUsers", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.RolesByUsers", "CreatedBy", c => c.String());
            AddColumn("dbo.RolesByUsers", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.RolesByUsers", "UpdatedBy", c => c.String());
            AddColumn("dbo.RolesByUsers", "IsActive", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.RolesByUsers", "IsActive");
            DropColumn("dbo.RolesByUsers", "UpdatedBy");
            DropColumn("dbo.RolesByUsers", "UpdateDate");
            DropColumn("dbo.RolesByUsers", "CreatedBy");
            DropColumn("dbo.RolesByUsers", "CreatedDate");
            DropColumn("dbo.PermsByRoles", "IsActive");
            DropColumn("dbo.PermsByRoles", "UpdatedBy");
            DropColumn("dbo.PermsByRoles", "UpdateDate");
            DropColumn("dbo.PermsByRoles", "CreatedBy");
            DropColumn("dbo.PermsByRoles", "CreatedDate");
        }
    }
}
