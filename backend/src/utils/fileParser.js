const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

/**
 * Extracts columns, sample rows, and total row count from a file.
 * Supports CSV, JSON, and XLSX.
 */
const parseDataFile = async (filePath, originalFileName, previewLimit = 50) => {
  const ext = path.extname(originalFileName || filePath).toLowerCase();

  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist on disk.');
  }

  if (ext === '.csv') {
    return new Promise((resolve, reject) => {
      const rows = [];
      let columns = [];
      let totalRows = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          columns = headers.map((h) => h.trim());
        })
        .on('data', (data) => {
          totalRows++;
          if (rows.length < previewLimit) {
            rows.push(data);
          }
        })
        .on('end', () => {
          if (columns.length === 0 && rows.length > 0) {
            columns = Object.keys(rows[0]);
          }
          resolve({
            format: 'CSV',
            columns,
            sampleRows: rows,
            totalRows,
          });
        })
        .on('error', (err) => {
          reject(new Error(`Failed to parse CSV: ${err.message}`));
        });
    });
  } else if (ext === '.json') {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    let parsed = JSON.parse(rawContent);

    // If json has an array property (e.g. data or records) or is an array directly
    let dataArray = [];
    if (Array.isArray(parsed)) {
      dataArray = parsed;
    } else if (parsed && typeof parsed === 'object') {
      const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (arrayKey) {
        dataArray = parsed[arrayKey];
      } else {
        dataArray = [parsed];
      }
    }

    const columns = dataArray.length > 0 ? Object.keys(dataArray[0]) : [];
    const sampleRows = dataArray.slice(0, previewLimit);

    return {
      format: 'JSON',
      columns,
      sampleRows,
      totalRows: dataArray.length,
    };
  } else if (ext === '.xlsx') {
    const workbook = xlsx.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const sampleRows = data.slice(0, previewLimit);

    return {
      format: 'XLSX',
      sheetName: firstSheetName,
      columns,
      sampleRows,
      totalRows: data.length,
    };
  } else {
    throw new Error(`Unsupported file format for parsing: ${ext}`);
  }
};

module.exports = { parseDataFile };
