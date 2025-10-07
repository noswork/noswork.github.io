// 檔案處理模組
import { CONFIG } from './config.js';

export class FileHandler {
    constructor() {
        this.files = [];
    }

    // 驗證檔案
    validateFile(file) {
        // 檢查檔案大小
        if (file.size > CONFIG.maxFileSize) {
            throw new Error(`檔案 "${file.name}" 超過大小限制（50MB）`);
        }

        // 檢查檔案格式
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!CONFIG.supportedFormats.includes(ext)) {
            throw new Error(`不支援的檔案格式：${ext}`);
        }

        return true;
    }

    // 讀取檔案內容
    async readFile(file) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        switch (ext) {
            case '.txt':
            case '.srt':
            case '.csv':
            case '.md':
                return await this.readTextFile(file);
            case '.doc':
            case '.docx':
                return await this.readDocFile(file);
            case '.pdf':
                return await this.readPdfFile(file);
            default:
                throw new Error(`不支援的檔案格式：${ext}`);
        }
    }

    // 讀取文本檔案
    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('讀取檔案失敗'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    // 讀取 Word 檔案
    async readDocFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } catch (error) {
            throw new Error('讀取 Word 檔案失敗：' + error.message);
        }
    }

    // 讀取 PDF 檔案
    async readPdfFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                text += pageText + '\n';
            }

            return text;
        } catch (error) {
            throw new Error('讀取 PDF 檔案失敗：' + error.message);
        }
    }

    // 生成下載
    downloadText(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 批次下載為 ZIP
    async downloadAsZip(files, zipFilename = 'converted.zip') {
        const zip = new JSZip();

        files.forEach(file => {
            zip.file(file.name, file.content);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 格式化檔案大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // 獲取檔案圖標
    getFileIcon(filename) {
        const ext = '.' + filename.split('.').pop().toLowerCase();
        const icons = {
            '.txt': 'fa-file-alt',
            '.srt': 'fa-closed-captioning',
            '.csv': 'fa-file-csv',
            '.doc': 'fa-file-word',
            '.docx': 'fa-file-word',
            '.pdf': 'fa-file-pdf',
            '.md': 'fa-markdown'
        };
        return icons[ext] || 'fa-file';
    }
}

