const SPREADSHEET_ID = "1sLbGUCNqFEue8T55Vj1Rm4m-KicdyXGUm0e4sIt_Jw0";
const sheetNameArr = [ "sheet1", "sheet2", "sheet3", "sheet4", "sheet5", "sheet6"]

const KEYFILEPATH = "./key.json";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

module.exports = {
    sheetNameArr,
    KEYFILEPATH,
    SPREADSHEET_ID,
    SCOPES
}