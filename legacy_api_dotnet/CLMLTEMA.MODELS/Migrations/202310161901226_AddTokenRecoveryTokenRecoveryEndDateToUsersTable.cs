namespace CLMLTEMA.MODELS.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddTokenRecoveryTokenRecoveryEndDateToUsersTable : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Users", "TokenRecovery", c => c.String());
            AddColumn("dbo.Users", "TokenRecoveryEndDate", c => c.DateTime(nullable: true));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Users", "TokenRecoveryEndDate");
            DropColumn("dbo.Users", "TokenRecovery");
        }
    }
}
