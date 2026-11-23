/**
 * 姓名：卜宁 | 学号：24001010202 | 时间：2026-11-23 | 大模型：DeepSeek-V4-Flash
 * 知识库文件解析：txt/md/pdf/docx/doc/pptx
 */
const fs = require('fs');
const path = require('path');

function extOf(name) {
  return (path.extname(name || '') || '').toLowerCase();
}

async function parseTxt(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

async function parsePdf(filePath) {
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(fs.readFileSync(filePath));
  return data.text || '';
}

async function parseDocx(filePath) {
  const mammoth = require('mammoth');
  const r = await mammoth.extractRawText({ path: filePath });
  return r.value || '';
}

async function parseDoc(filePath) {
  const WordExtractor = require('word-extractor');
  const ext = new WordExtractor();
  const doc = await ext.extract(filePath);
  return doc.getBody() || '';
}

async function parsePptx(filePath) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries().filter(function (e) {
    return /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName);
  });
  entries.sort(function (a, b) {
    const na = parseInt(a.entryName.match(/slide(\d+)\.xml/)[1], 10);
    const nb = parseInt(b.entryName.match(/slide(\d+)\.xml/)[1], 10);
    return na - nb;
  });
  const parts = [];
  entries.forEach(function (e, idx) {
    const xml = e.getData().toString('utf8');
    const texts = [];
    const re = /<a:t>([\s\S]*?)<\/a:t>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const t = m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
      if (t) texts.push(t);
    }
    if (texts.length) parts.push('【第 ' + (idx + 1) + ' 页】\n' + texts.join('\n'));
  });
  return parts.join('\n\n');
}

/**
 * 解析支持的文档，返回纯文本
 */
async function parseFile(filePath, originalName) {
  const ext = extOf(originalName || filePath);
  switch (ext) {
    case '.txt':
    case '.md':
    case '.csv':
      return await parseTxt(filePath);
    case '.pdf':
      return await parsePdf(filePath);
    case '.docx':
      return await parseDocx(filePath);
    case '.doc':
      return await parseDoc(filePath);
    case '.pptx':
      return await parsePptx(filePath);
    case '.ppt':
      throw new Error('旧版 .ppt 无法直接解析，请在 PowerPoint 里另存为 .pptx 后再上传');
    default:
      throw new Error('暂不支持的文件类型：' + ext + '（支持 txt/md/csv/pdf/docx/doc/pptx）');
  }
}

module.exports = { parseFile, extOf };
