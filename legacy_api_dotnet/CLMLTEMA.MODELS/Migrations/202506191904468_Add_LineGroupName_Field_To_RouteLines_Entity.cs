namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Add_LineGroupName_Field_To_RouteLines_Entity : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.RouteLines", "LineGroupNum", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.RouteLines", "LineGroupNum");
        }
    }
}
