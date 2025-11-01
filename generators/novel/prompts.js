const styleGuide = (style) => {
  const s = (style||'').trim();
  if(!s || s === '正常') return `- 文風自然，語句精煉，不誇飾，不堆疊形容。`;
  if(s.includes('極簡')) return `- 極簡：少形容詞、少連接詞，短句為主，留白多於說明。`;
  if(s.includes('詩意')) return `- 詩意：強畫面、隱喻與意象並用，動靜對比，聲色氣味可適度介入。`;
  if(s.includes('黑色幽默')) return `- 黑色幽默：反諷與反差，語氣冷面，末尾輕微刺點。`;
  if(s.includes('日常') || s.includes('寫實')) return `- 日常寫實：場景細節具體（時間/光線/物件），對話與動作簡短。`;
  if(s.includes('反轉')) return `- 反轉結尾：收束於最後一句的輕巧翻轉，避免生硬解釋或硬拐點。`;
  return `- 風格：依「${s}」拿捏節奏與語氣。`;
}

const adultGuide = ({adultOn=false, adultFull=false}) => {
  if(!adultOn) return '';
  const common = ``;
  if(adultFull) return `${common}
- 成人火力全開：允許最直白、最露骨的描寫與詞彙（如：陰莖、龜頭、精液、陰蒂、乳頭、乳暈、陰道、小穴、抽插、高潮、潮吹、射精、濕、喘息、顫抖等），可具體描寫身體與動作；避免清單式羅列與技巧教學語氣，保留節奏與畫面感。`;
  return `${common}
- 成人基調：可直接描寫身體與動作，語氣克制但不含糊，詞彙自然不做作；避免技巧步驟與教學語氣。`;
}

export const NOVEL_SYSTEM = ({ theme, styleText, maxLen=500, adultOn=false, adultFull=false }) => {
  return `你是一位微小說作家。請用正體中文寫一段不超過 ${maxLen} 字的微小說，單段輸出，不分行。
規則：
- 單段文字，禁止列點、數字編號、任何前綴、引號與括號、額外符號。
- 主題與關鍵字（若提供）需自然融入，不重複堆疊，不做旁白式說教。
- 場景具體、畫面優先，動作與意象帶動情緒；避免總結式語句。
- 結尾自然收束，可留暗示與回味，不硬轉場或強行解釋。
- 僅輸出小說內容，不要解釋、不輸出思考過程或任何系統/模型相關文字。
${styleGuide(styleText)}
${adultGuide({adultOn, adultFull})}
長度上限：${maxLen} 字；主題：${theme||'（不限）'}`;
}

export const buildSystemPromptFromState = ({ theme, styleText, maxLen, adultOn, adultFull }) => NOVEL_SYSTEM({ theme, styleText, maxLen, adultOn, adultFull });


