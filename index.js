const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const { google } = require("googleapis");

const { sheetNameArr, KEYFILEPATH, SPREADSHEET_ID, SCOPES } = require("./config");

const accessGoogleSheet = async (islandId) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: "v4", auth });

    const range = sheetNameArr[islandId];
    console.log("sheet name:", range);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });

    const rows = response.data.values;
    return rows;
  } catch (err) {
    console.log("access error", err);
  }
};

const analyzeSheet = (sheetData) => {
  const numRows = sheetData.length;
  const numCols = sheetData[0].length;

  let result = [];
  if (numRows === 1 && numCols === 1) {
    result.push("(0, 0)");
    return result;
  }

  const directions = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1],
  ];

  const dfs = (i, j, visited, reachable) => {
    const key = `${i},${j}`;
    if (visited.has(key)) return;
    visited.add(key);

    for (let [di, dj] of directions) {
      const newI = i + di;
      const newJ = j + dj;
      if (
        newI >= 0 &&
        newI < numRows &&
        newJ >= 0 &&
        newJ < numCols &&
        sheetData[newI][newJ] - sheetData[i][j] >= 0
      ) {
        reachable.add(`(${newI}, ${newJ})`);
        dfs(newI, newJ, visited, reachable);
      }
    }
  };

  let northwestFlowable = new Set(["(0, 0)"]);
  let southeastFlowable = new Set([`(${numRows-1}, ${numCols -1})`]);

  //start dfs from northwest edge
  let visited = new Set();
  dfs(0, 0, visited, northwestFlowable);

  //start dfs from southeast edge
  visited.clear();
  dfs(numRows - 1, numCols - 1, visited, southeastFlowable);

  //intersection
  result = [...northwestFlowable].filter((e) => southeastFlowable.has(e));
  //   console.log(result);
  return result;
};

app.get("/:id", async (req, res) => {
  const sheetData = await accessGoogleSheet(req.params.id);
  const analyzedData = analyzeSheet(sheetData);
  res.status(200).json({sheetData, analyzedData});
  console.log(sheetData, analyzedData);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
