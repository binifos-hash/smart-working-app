using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartWorking.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMustChangePassword : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "MustChangePassword",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MustChangePassword", "PasswordHash" },
                values: new object[] { false, "$2a$11$LusXnmHnuPeS3.BrHNwMaekMPlY6Bl8YE.DnplZ3U7w44dkM4n3UG" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MustChangePassword",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$kVjNNlO7BY.wB.HsaWx7TOfzh8tAloaRKkg3WfK6vWgo7ycbS4zyC");
        }
    }
}
