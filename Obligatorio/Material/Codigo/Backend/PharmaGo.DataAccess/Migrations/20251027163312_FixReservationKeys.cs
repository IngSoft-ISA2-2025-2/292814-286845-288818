using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmaGo.DataAccess.Migrations
{
    public partial class FixReservationKeys : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReservationDrugs_Drugs_DrugId",
                table: "ReservationDrugs");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Pharmacys_PharmacyId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_PharmacyId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "PharmacyId",
                table: "Reservations");

            migrationBuilder.AlterColumn<string>(
                name: "PharmacyName",
                table: "Reservations",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Pharmacys",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Pharmacys_Name",
                table: "Pharmacys",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_PharmacyName",
                table: "Reservations",
                column: "PharmacyName");

            migrationBuilder.AddForeignKey(
                name: "FK_ReservationDrugs_Drugs_DrugId",
                table: "ReservationDrugs",
                column: "DrugId",
                principalTable: "Drugs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Pharmacys_PharmacyName",
                table: "Reservations",
                column: "PharmacyName",
                principalTable: "Pharmacys",
                principalColumn: "Name",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReservationDrugs_Drugs_DrugId",
                table: "ReservationDrugs");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Pharmacys_PharmacyName",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_PharmacyName",
                table: "Reservations");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Pharmacys_Name",
                table: "Pharmacys");

            migrationBuilder.AlterColumn<string>(
                name: "PharmacyName",
                table: "Reservations",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PharmacyId",
                table: "Reservations",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Pharmacys",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_PharmacyId",
                table: "Reservations",
                column: "PharmacyId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReservationDrugs_Drugs_DrugId",
                table: "ReservationDrugs",
                column: "DrugId",
                principalTable: "Drugs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Pharmacys_PharmacyId",
                table: "Reservations",
                column: "PharmacyId",
                principalTable: "Pharmacys",
                principalColumn: "Id");
        }
    }
}
