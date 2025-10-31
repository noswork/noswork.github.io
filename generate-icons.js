#!/usr/bin/env node

/**
 * Favicon 生成腳本
 * 
 * 此腳本將 favicon.svg 轉換為不同尺寸的 PNG 圖標
 * 
 * 使用方法：
 * 1. 安裝依賴：npm install sharp
 * 2. 運行腳本：node generate-icons.js
 * 
 * 或使用 npx（無需安裝）：
 * npx -p sharp node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// 檢查是否安裝了 sharp
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('❌ 錯誤：未找到 sharp 模組');
  console.error('');
  console.error('請先安裝 sharp：');
  console.error('  npm install sharp');
  console.error('');
  console.error('或使用 npx 運行（無需安裝）：');
  console.error('  npx -p sharp node generate-icons.js');
  process.exit(1);
}

// 配置：需要生成的圖標尺寸
const icons = [
  { name: 'favicon-16x16.png', size: 16, description: 'Browser favicon (16x16)' },
  { name: 'favicon-32x32.png', size: 32, description: 'Browser favicon (32x32)' },
  { name: 'apple-touch-icon.png', size: 180, description: 'iOS Safari' },
  { name: 'icon-192.png', size: 192, description: 'Android Chrome' },
  { name: 'icon-512.png', size: 512, description: 'Android Chrome (large)' }
];

// 可遮罩圖標需要額外的內邊距（安全區域）
const maskableIcons = [
  { name: 'icon-maskable-192.png', size: 192, padding: 38, description: 'Maskable icon (192x192)' },
  { name: 'icon-maskable-512.png', size: 512, padding: 102, description: 'Maskable icon (512x512)' }
];

// 文件路徑
const svgPath = path.join(__dirname, 'favicon.svg');
const outputDir = path.join(__dirname, 'assets', 'icons');

// 確保輸出目錄存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 檢查 SVG 文件是否存在
if (!fs.existsSync(svgPath)) {
  console.error('❌ 錯誤：找不到 favicon.svg 文件');
  console.error(`   請確保文件存在於：${svgPath}`);
  process.exit(1);
}

console.log('🎨 開始生成 favicon 圖標...\n');

/**
 * 生成標準圖標
 */
async function generateStandardIcons() {
  console.log('📦 生成標準圖標：');
  
  for (const icon of icons) {
    const outputPath = path.join(outputDir, icon.name);
    
    try {
      await sharp(svgPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size}) - ${sizeKB} KB`);
      console.log(`     ${icon.description}`);
    } catch (err) {
      console.error(`  ❌ 生成 ${icon.name} 失敗：${err.message}`);
    }
  }
}

/**
 * 生成可遮罩圖標（帶內邊距）
 */
async function generateMaskableIcons() {
  console.log('\n🎭 生成可遮罩圖標（Maskable Icons）：');
  
  for (const icon of maskableIcons) {
    const outputPath = path.join(outputDir, icon.name);
    const contentSize = icon.size - (icon.padding * 2);
    
    try {
      // 首先將 SVG 調整為內容尺寸
      const contentBuffer = await sharp(svgPath)
        .resize(contentSize, contentSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      // 創建帶漸層背景的畫布
      const gradientSvg = `
        <svg width="${icon.size}" height="${icon.size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${icon.size}" height="${icon.size}" fill="url(#bg)" rx="22"/>
        </svg>
      `;
      
      // 將內容疊加到背景上
      await sharp(Buffer.from(gradientSvg))
        .composite([{
          input: contentBuffer,
          top: icon.padding,
          left: icon.padding
        }])
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      console.log(`  ✅ ${icon.name} (${icon.size}x${icon.size}) - ${sizeKB} KB`);
      console.log(`     ${icon.description}`);
    } catch (err) {
      console.error(`  ❌ 生成 ${icon.name} 失敗：${err.message}`);
    }
  }
}

/**
 * 顯示摘要
 */
function showSummary() {
  console.log('\n📊 生成摘要：');
  console.log(`  📁 輸出目錄：${outputDir}`);
  console.log(`  ✅ 已生成 ${icons.length + maskableIcons.length} 個圖標文件`);
  console.log('');
  console.log('🎉 所有圖標已成功生成！');
  console.log('');
  console.log('📝 下一步：');
  console.log('  1. 檢查生成的圖標是否正確');
  console.log('  2. 提交並推送到 GitHub');
  console.log('  3. 等待部署完成');
  console.log('  4. 訪問網站測試 favicon 顯示');
  console.log('');
  console.log('🔍 測試建議：');
  console.log('  - 清除瀏覽器快取後重新訪問');
  console.log('  - 在不同瀏覽器中測試（Chrome、Safari、Firefox）');
  console.log('  - 在手機上測試（iOS、Android）');
  console.log('  - 將網站添加到主畫面測試圖標顯示');
}

/**
 * 主函數
 */
async function main() {
  try {
    await generateStandardIcons();
    await generateMaskableIcons();
    showSummary();
  } catch (err) {
    console.error('\n❌ 發生錯誤：', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// 運行腳本
main();

