https://docs.google.com/spreadsheets/d/ID_YOUR_SHEET/edit#gid=0
var SHEETS_ID = CHANGE_TO_ID_YOUR_SHEET;


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
  
  switch(action) {
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
      data: resultData,
    }
  }
  
  var result = JSON.stringify(data);
  return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
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
  
  switch(action) {
    case "insert":
      return insert_data(e, sheet, "BELUM");
      break;
    case "update": 
      return update_data(e, sheet);
      break;
  }
}      

function insert_data(req, sheet, isHadir) {
  var id = req.parameter.id;
  var name = req.parameter.name;

  sheet.appendRow([id, name, isHadir]);
  var result = { success: true, message: 'Data berhasil ditambahkan'};
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function update_data(req, sheet) {
  var id = req.parameter.id;
  var isHadir = req.parameter.isHadir;
  
  var flag = 0;
  var lastRow = sheet.getLastRow();
  var result = {
    success: false,
    message: "Data tidak ditemukan",
  };
  
  for (var row = 2; row <= lastRow; row++) {
    var idFromServer = sheet.getRange(row, 1).getValue();
    
    if (id == idFromServer) {
      sheet.getRange(row, 3).setValue(isHadir);
      flag = 1;
    }
  }
  
  if (flag === 1) {
    result = {
      success: true,
      message: "Data berhasil diperbaharui",
    };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
