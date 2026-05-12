/**
 * GOOGLE APPS SCRIPT — Wedding RSVP to Google Sheets
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Abre Google Sheets (crea una nueva hoja)
 * 2. Ve a Extensiones → Apps Script
 * 3. Borra el código existente y pega este archivo completo
 * 4. Cambia SHEET_NAME si es necesario
 * 5. Haz clic en "Implementar" → "Nueva implementación"
 * 6. Tipo: "Aplicación web"
 *    - Ejecutar como: "Yo (tu cuenta)"
 *    - Quien tiene acceso: "Cualquier usuario"
 * 7. Autoriza los permisos
 * 8. Copia la URL de implementación
 * 9. Pégala en src/components/main.js como GOOGLE_SHEET_URL
 */

const SHEET_NAME = 'RSVP';

function doPost(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let sheet   = ss.getSheetByName(SHEET_NAME);

    // Create sheet + headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Fecha', 'Nombre', 'Teléfono', 'Email',
        'Eventos', 'Acompañantes', 'Num. Acompañantes'
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp     || new Date().toLocaleString('es-MX'),
      data.nombre        || '',
      data.telefono      || '',
      data.email         || '',
      data.eventos       || '',
      data.acompanantes  || '',
      data.numAcompanantes || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// For testing via GET (browser)
function doGet(e) {
  return ContentService
    .createTextOutput('Wedding RSVP endpoint is live ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}
