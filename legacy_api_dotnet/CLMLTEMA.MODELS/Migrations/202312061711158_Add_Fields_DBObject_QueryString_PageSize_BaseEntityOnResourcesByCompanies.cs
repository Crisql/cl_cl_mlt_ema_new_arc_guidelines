namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_Fields_DBObject_QueryString_PageSize_BaseEntityOnResourcesByCompanies : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.ResourcesByCompanies", "DBObject", c => c.String());
            AddColumn("dbo.ResourcesByCompanies", "QueryString", c => c.String());
            AddColumn("dbo.ResourcesByCompanies", "PageSize", c => c.Int(nullable: false));
            AddColumn("dbo.ResourcesByCompanies", "CreatedDate", c => c.DateTime(nullable: false));
            AddColumn("dbo.ResourcesByCompanies", "CreatedBy", c => c.String());
            AddColumn("dbo.ResourcesByCompanies", "UpdateDate", c => c.DateTime());
            AddColumn("dbo.ResourcesByCompanies", "UpdatedBy", c => c.String());
            AddColumn("dbo.ResourcesByCompanies", "IsActive", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.ResourcesByCompanies", "IsActive");
            DropColumn("dbo.ResourcesByCompanies", "UpdatedBy");
            DropColumn("dbo.ResourcesByCompanies", "UpdateDate");
            DropColumn("dbo.ResourcesByCompanies", "CreatedBy");
            DropColumn("dbo.ResourcesByCompanies", "CreatedDate");
            DropColumn("dbo.ResourcesByCompanies", "PageSize");
            DropColumn("dbo.ResourcesByCompanies", "QueryString");
            DropColumn("dbo.ResourcesByCompanies", "DBObject");
        }
    }
}
