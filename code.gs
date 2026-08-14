// ===== CẤU HÌNH =====
const SHEET_NAME = 'YeuCauHoTro';
const FOLDER_NAME = 'ThoiTiet';
const RECIPIENT_EMAIL = 'kysythacgian@gmail.com'; // Địa chỉ nhận thông báo

// ===== HÀM NHẬN DỮ LIỆU TỪ WEB APP =====
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    const folder = getOrCreateFolder(FOLDER_NAME);
    const spreadsheet = getOrCreateSpreadsheet(folder, SHEET_NAME);
    const sheet = spreadsheet.getActiveSheet();
    
    const timestamp = data.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    sheet.appendRow([
      timestamp,
      data.name,
      data.address,
      data.phone,
      data.content
    ]);
    
    sendNotificationEmail(data, timestamp);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    logError('doPost', error);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== HÀM GỬI EMAIL - BẢN NÂNG CẤP GIAO DIỆN =====
function sendNotificationEmail(data, timestamp) {
  try {
    if (!RECIPIENT_EMAIL || !RECIPIENT_EMAIL.includes('@')) {
      throw new Error('Email người nhận không hợp lệ: ' + RECIPIENT_EMAIL);
    }
    
    const subject = 'Yeu cau ho tro moi tu 25 Thac Gian';
    
    // Nội dung dạng Text thuần (dự phòng cho email cũ)
    const plainBody = `
      Có một yêu cầu hỗ trợ/góp ý mới:
      Họ tên: ${data.name || 'Không có'}
      Địa chỉ: ${data.address || 'Không có'}
      Số điện thoại: ${data.phone || 'Không có'}
      Nội dung: ${data.content || 'Không có'}
      Thời gian: ${timestamp || 'Không xác định'}
    `;

    // Nội dung dạng HTML - GIAO DIỆN ĐẸP MẮT, KHÔNG DÙNG EMOJI
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: #004DFF; color: #ffffff; padding: 25px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 21px; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.85; font-size: 13px; }
        .content { padding: 25px 30px; }
        .info-row { display: flex; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid #eef2f7; }
        .info-row:last-of-type { border-bottom: none; }
        .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #004DFF; margin: 6px 10px 0 0; flex-shrink: 0; }
        .label { width: 110px; font-weight: 600; color: #555; font-size: 14px; flex-shrink: 0; }
        .value { flex: 1; color: #1e3c72; font-size: 15px; word-break: break-word; }
        .value-pre { white-space: pre-wrap; word-break: break-word; }
        .timestamp-box { margin-top: 20px; padding-top: 15px; border-top: 2px dashed #e0e0e0; color: #888; font-size: 13px; text-align: right; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #eee; }
        .badge { display: inline-block; background: #fdeaea; color: #d93025; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
        @media (max-width: 480px) {
          .info-row { flex-direction: column; padding: 12px 0; }
          .label { width: 100%; margin-bottom: 4px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Phần đầu -->
        <div class="header">
          <h1>YÊU CẦU HỖ TRỢ MỚI</h1>
          <p>Hệ thống tiếp nhận khẩn cấp &ndash; Tổ 25 Thạc Gián</p>
        </div>
        
        <!-- Phần thân -->
        <div class="content">
          <div class="info-row">
            <span class="dot"></span>
            <span class="label">Họ và tên</span>
            <span class="value"><b>${data.name || 'Không có'}</b></span>
          </div>
          <div class="info-row">
            <span class="dot"></span>
            <span class="label">Địa chỉ</span>
            <span class="value">${data.address || 'Không có'}</span>
          </div>
          <div class="info-row">
            <span class="dot"></span>
            <span class="label">Số điện thoại</span>
            <span class="value"><b style="color:#004DFF;">${data.phone || 'Không có'}</b></span>
          </div>
          <div class="info-row">
            <span class="dot"></span>
            <span class="label">Nội dung</span>
            <span class="value value-pre">${(data.content || 'Không có').replace(/\n/g, '<br>')}</span>
          </div>
          
          <div class="timestamp-box">
            Thời gian gửi: <b>${timestamp || 'Không xác định'}</b>
          </div>
        </div>
        
        <!-- Phần chân -->
        <div class="footer">
          <span class="badge">KHẨN CẤP</span>
          <span style="margin-left: 10px;">Vui lòng xử lý trong thời gian sớm nhất</span>
          <br><small style="color: #aaa;">Email này được tự động gửi từ Google Apps Script</small>
        </div>
      </div>
    </body>
    </html>
    `;

    // Gửi email với cả plain text và HTML
    GmailApp.sendEmail(RECIPIENT_EMAIL, subject, plainBody, { htmlBody: htmlBody });
    logEmailSuccess(data, timestamp);
    
  } catch (error) {
    logError('sendNotificationEmail', error, data);
  }
}

// ===== CÁC HÀM HỖ TRỢ =====
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function getOrCreateSpreadsheet(folder, sheetName) {
  const files = folder.getFilesByName(sheetName);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create(sheetName);
  const file = DriveApp.getFileById(ss.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  const sheet = ss.getActiveSheet();
  sheet.appendRow(['Thời gian', 'Họ tên', 'Địa chỉ', 'Số điện thoại', 'Nội dung']);
  return ss;
}

function logError(functionName, error, data) {
  try {
    const folder = getOrCreateFolder(FOLDER_NAME);
    const files = folder.getFilesByName('EmailLog');
    let ss;
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create('EmailLog');
      const file = DriveApp.getFileById(ss.getId());
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      ss.getActiveSheet().appendRow(['Thời gian', 'Trạng thái', 'Chi tiết', 'Dữ liệu']);
    }
    ss.getActiveSheet().appendRow([
      new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      'ERROR: ' + functionName,
      error.toString(),
      data ? JSON.stringify(data) : ''
    ]);
  } catch (e) {}
}

function logEmailSuccess(data, timestamp) {
  try {
    const folder = getOrCreateFolder(FOLDER_NAME);
    const files = folder.getFilesByName('EmailLog');
    let ss;
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create('EmailLog');
      const file = DriveApp.getFileById(ss.getId());
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      ss.getActiveSheet().appendRow(['Thời gian', 'Trạng thái', 'Chi tiết', 'Dữ liệu']);
    }
    ss.getActiveSheet().appendRow([
      new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      'SUCCESS',
      'Email sent to ' + RECIPIENT_EMAIL,
      data ? data.name : ''
    ]);
  } catch (e) {}
}

function doGet() {
  return ContentService.createTextOutput('Web App is running!');
}