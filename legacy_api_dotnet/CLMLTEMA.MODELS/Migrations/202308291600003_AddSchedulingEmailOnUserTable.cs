namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddSchedulingEmailOnUserTable : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Users", "SchedulingEmail", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Users", "SchedulingEmail");
        }
    }
}
