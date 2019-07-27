var SHEETS_ID = "YOUR_SHEET_KEY";

/**
 * GET METHOD DATA
 * -------------------------
 * TABLE OF CONTENTS
 * 1. GET ALL DATA
 * 2. GET CUSTOM ROW
 * 3. GET STASTIC DATA
 * -------------------------
 */
function doGet(request) {
  var ssID = SpreadsheetApp.openById(SHEETS_ID);
  var tableName = request.parameter.tableName;
  var sheet = ssID.getSheetByName(tableName);
  var action = request.parameter.action;

  switch (action) {
    case "read":
      return get_data(sheet, tableName);
      break;
  }
}

function get_data(sheet, tableName) {
  var data = { success: false, data: [] };
  var resultData = get_object_data(sheet);

  if (resultData.length > 0) {
    data = {
      success: true,
      data: resultData
    };
  }

  var result = JSON.stringify(data);
  return ContentService.createTextOutput(result).setMimeType(
    ContentService.MimeType.JSON
  );
}

function get_object_data(sheet) {
  var allData = [];
  var rangeObject = sheet.getDataRange().getValues();
  var totalColumn = sheet.getLastColumn();

  for (var row = 1; row < rangeObject.length; row++) {
    var object = {};

    for (var column = 0; column < totalColumn; column++) {
      object[rangeObject[0][column]] = rangeObject[row][column];
    }

    allData.push(object);
  }

  return allData;
}

/**
 * POST METHOD DATA
 * THIS FUNCTION WILL BE HANDLE ALL FUNCTION WITH POST METHOD REQUEST
 * --------------------------------------
 * Table of Contents
 * 1. INSERT DATA
 * 2. UPDATE DATE
 * --------------------------------------
 */
function doPost(e) {
  var ssID = SpreadsheetApp.openById(SHEETS_ID);
  var tableName = e.parameter.tableName;
  var action = e.parameter.action;
  var sheet = ssID.getSheetByName(tableName);

  switch (action) {
    case "insert":
      return insert_data(e, sheet, "BELUM");
      break;
    case "update":
      return update_data(e, sheet);
      break;
    case "qr_code":
      return scan_qr(e, sheet);
      break;
  }
}

function insert_data(req, sheet, isHadir) {
  var id = req.parameter.id;
  var name = req.parameter.name;

  sheet.appendRow([id, name, isHadir]);
  var result = { success: true, message: "Data berhasil ditambahkan" };

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function scan_qr(req, sheet) {
  var idQR = req.parameter.id;

  var isSuccess = false;
  var successFullyExchanged = 1;
  var lastRow = sheet.getLastRow();

  var result = {
    success: false,
    message: "Data QR tidak ditemukan. Mohon periksa kembali"
  };

  for (var row = 2; row <= lastRow; row++) {
    var idQRFromServer = sheet.getRange(row, 1).getValue();
    var statusFromServer = sheet.getRange(row, 2).getValue();

    if (idQR == idQRFromServer) {
      if (statusFromServer == successFullyExchanged) {
        result = {
          success: false,
          message: "Kode QR sudah ditukarkan!"
        };
      } else {
        sheet.getRange(row, 2).setValue(successFullyExchanged);
        result = {
          success: true,
          message: "Kode QR berhasil ditukarkan."
        };
      }
      row = lastRow;
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function update_data(req, sheet) {
  var id = req.parameter.id;
  var isHadir = req.parameter.isHadir;

  var flag = 0;
  var lastRow = sheet.getLastRow();
  var result = {
    success: false,
    message: "Data tidak ditemukan"
  };

  for (var row = 2; row <= lastRow; row++) {
    var idFromServer = sheet.getRange(row, 1).getValue();

    if (id == idFromServer) {
      sheet.getRange(row, 3).setValue(isHadir);
      flag = 1;
      row = lastRow;
    }
  }

  if (flag === 1) {
    result = {
      success: true,
      message: "Data berhasil diperbaharui"
    };
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}
