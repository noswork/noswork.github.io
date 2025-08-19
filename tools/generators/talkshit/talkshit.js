// 分離逐字打字輸出與事件綁定
export const typeText = async (el, text, speed = 18) => {
  // 保持 caret 跟隨：使用 data-caret 方式由 CSS ::after 顯示在尾端
  el.textContent = "";
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    el.textContent += chars[i];
    await new Promise(r => setTimeout(r, speed));
  }
};

export const typeLines = async (el, lines, speed = 18, lineGap = 180) => {
  el.textContent = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    await typeText(el, (el.textContent ? el.textContent + "\n" : "") + line, speed);
    if (i < lines.length - 1) await new Promise(r => setTimeout(r, lineGap));
  }
};


