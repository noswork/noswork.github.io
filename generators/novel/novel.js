export const typeText = async (el, text, speed = 14) => {
  el.textContent = "";
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    el.textContent += chars[i];
    await new Promise(r => setTimeout(r, speed));
  }
};

export const typeLines = async (el, lines, speed = 14, lineGap = 160) => {
  el.textContent = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    await typeText(el, (el.textContent ? el.textContent + "\n" : "") + line, speed);
    if (i < lines.length - 1) await new Promise(r => setTimeout(r, lineGap));
  }
};


