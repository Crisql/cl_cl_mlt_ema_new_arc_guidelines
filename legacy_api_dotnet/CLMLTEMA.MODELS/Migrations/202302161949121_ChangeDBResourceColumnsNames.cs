namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangeDBResourceColumnsNames : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.DBResources", "Code", c => c.String());
            AddColumn("dbo.DBResources", "DBObject", c => c.String());
            AddColumn("dbo.DBResources", "QueryString", c => c.String());
            AddColumn("dbo.DBResources", "PageSize", c => c.Int(nullable: false));
            DropColumn("dbo.DBResources", "Name");
            DropColumn("dbo.DBResources", "Resource");
        }
        
        public override void Down()
        {
            AddColumn("dbo.DBResources", "Resource", c => c.String());
            AddColumn("dbo.DBResources", "Name", c => c.String());
            DropColumn("dbo.DBResources", "PageSize");
            DropColumn("dbo.DBResources", "QueryString");
            DropColumn("dbo.DBResources", "DBObject");
            DropColumn("dbo.DBResources", "Code");
        }
    }
}
