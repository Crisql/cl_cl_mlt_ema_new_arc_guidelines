namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_BaseEntityProperties : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Companies", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Companies", "CreatedBy", c => c.String());
            AddColumn("dbo.Companies", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Companies", "UpdatedBy", c => c.String());
            AddColumn("dbo.Connections", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Connections", "CreatedBy", c => c.String());
            AddColumn("dbo.Connections", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Connections", "UpdatedBy", c => c.String());
            AddColumn("dbo.Connections", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.DBResources", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.DBResources", "CreatedBy", c => c.String());
            AddColumn("dbo.DBResources", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.DBResources", "UpdatedBy", c => c.String());
            AddColumn("dbo.Licenses", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Licenses", "CreatedBy", c => c.String());
            AddColumn("dbo.Licenses", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Licenses", "UpdatedBy", c => c.String());
            AddColumn("dbo.Permissions", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Permissions", "CreatedBy", c => c.String());
            AddColumn("dbo.Permissions", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Permissions", "UpdatedBy", c => c.String());
            AddColumn("dbo.Roles", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Roles", "CreatedBy", c => c.String());
            AddColumn("dbo.Roles", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Roles", "UpdatedBy", c => c.String());
            AddColumn("dbo.Users", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Users", "CreatedBy", c => c.String());
            AddColumn("dbo.Users", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Users", "UpdatedBy", c => c.String());
            AddColumn("dbo.Settings", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Settings", "CreatedBy", c => c.String());
            AddColumn("dbo.Settings", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Settings", "UpdatedBy", c => c.String());
            AddColumn("dbo.Settings", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.Terminals", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.Terminals", "CreatedBy", c => c.String());
            AddColumn("dbo.Terminals", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.Terminals", "UpdatedBy", c => c.String());
            AddColumn("dbo.Terminals", "IsActive", c => c.Boolean(nullable: false));
            AddColumn("dbo.UserAssigns", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.UserAssigns", "CreatedBy", c => c.String());
            AddColumn("dbo.UserAssigns", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.UserAssigns", "UpdatedBy", c => c.String());
            AddColumn("dbo.UserAssigns", "IsActive", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.UserAssigns", "IsActive");
            DropColumn("dbo.UserAssigns", "UpdatedBy");
            DropColumn("dbo.UserAssigns", "UpdateDate");
            DropColumn("dbo.UserAssigns", "CreatedBy");
            DropColumn("dbo.UserAssigns", "CreatedDate");
            DropColumn("dbo.Terminals", "IsActive");
            DropColumn("dbo.Terminals", "UpdatedBy");
            DropColumn("dbo.Terminals", "UpdateDate");
            DropColumn("dbo.Terminals", "CreatedBy");
            DropColumn("dbo.Terminals", "CreatedDate");
            DropColumn("dbo.Settings", "IsActive");
            DropColumn("dbo.Settings", "UpdatedBy");
            DropColumn("dbo.Settings", "UpdateDate");
            DropColumn("dbo.Settings", "CreatedBy");
            DropColumn("dbo.Settings", "CreatedDate");
            DropColumn("dbo.Users", "UpdatedBy");
            DropColumn("dbo.Users", "UpdateDate");
            DropColumn("dbo.Users", "CreatedBy");
            DropColumn("dbo.Users", "CreatedDate");
            DropColumn("dbo.Roles", "UpdatedBy");
            DropColumn("dbo.Roles", "UpdateDate");
            DropColumn("dbo.Roles", "CreatedBy");
            DropColumn("dbo.Roles", "CreatedDate");
            DropColumn("dbo.Permissions", "UpdatedBy");
            DropColumn("dbo.Permissions", "UpdateDate");
            DropColumn("dbo.Permissions", "CreatedBy");
            DropColumn("dbo.Permissions", "CreatedDate");
            DropColumn("dbo.Licenses", "UpdatedBy");
            DropColumn("dbo.Licenses", "UpdateDate");
            DropColumn("dbo.Licenses", "CreatedBy");
            DropColumn("dbo.Licenses", "CreatedDate");
            DropColumn("dbo.DBResources", "UpdatedBy");
            DropColumn("dbo.DBResources", "UpdateDate");
            DropColumn("dbo.DBResources", "CreatedBy");
            DropColumn("dbo.DBResources", "CreatedDate");
            DropColumn("dbo.Connections", "IsActive");
            DropColumn("dbo.Connections", "UpdatedBy");
            DropColumn("dbo.Connections", "UpdateDate");
            DropColumn("dbo.Connections", "CreatedBy");
            DropColumn("dbo.Connections", "CreatedDate");
            DropColumn("dbo.Companies", "UpdatedBy");
            DropColumn("dbo.Companies", "UpdateDate");
            DropColumn("dbo.Companies", "CreatedBy");
            DropColumn("dbo.Companies", "CreatedDate");
        }
    }
}
