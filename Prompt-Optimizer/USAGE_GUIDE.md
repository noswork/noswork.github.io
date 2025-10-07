# 使用指南 / Usage Guide

## Claude & GPT-5 雙模式提示詞優化器

這個工具現在支持**雙模式切換**，讓您可以在 Claude 和 GPT-5 優化器之間自由選擇，並靈活配置 API 格式。

---

## 🚀 快速開始 / Quick Start

### 1. 打開設置面板

點擊側邊欄的「Settings」（設定）區域。

### 2. 選擇優化器類型

**Optimizer Type** (優化器類型):
- **Claude Prompt Optimizer**: 使用 Anthropic 的 metaprompt 方法
- **GPT-5 Prompt Optimizer**: 使用 GPT-5 best practices

### 3. 選擇 API 格式

**API Format** (API 格式):
- **OpenAI Format**: 適用於 OpenAI API 和兼容服務
- **Anthropic Format**: 適用於 Anthropic 原生 API

### 4. 配置 URL 自動補全

**Auto-complete API endpoint** (自動補全 API 端點):
- ✅ **勾選**: 自動添加 `/chat/completions` 或 `/v1/messages`
- ⬜ **不勾選**: 使用完整的自定義 URL

---

## 📋 常見配置場景 / Common Scenarios

### 場景 A: 使用 OpenAI API

```
Optimizer Type: GPT-5 Prompt Optimizer
API Format: OpenAI Format
Auto-complete: ✓
API Path: https://api.openai.com/v1
API Key: sk-xxx...
Model Name: gpt-4-turbo
```

**說明**: 
- URL 會自動變成 `https://api.openai.com/v1/chat/completions`
- 使用 GPT-5 的優化策略和 metaprompt

---

### 場景 B: 使用 Anthropic API

```
Optimizer Type: Claude Prompt Optimizer
API Format: Anthropic Format
Auto-complete: ✓
API Path: https://api.anthropic.com
API Key: sk-ant-xxx...
Model Name: claude-3-5-sonnet-20240620
```

**說明**:
- URL 會自動變成 `https://api.anthropic.com/v1/messages`
- 使用 Claude 的優化策略和 metaprompt
- 支持 assistant prefill 功能

---

### 場景 C: 使用代理服務 (OpenRouter)

```
Optimizer Type: Claude Prompt Optimizer
API Format: OpenAI Format
Auto-complete: ✗ (關閉)
API Path: https://openrouter.ai/api/v1/chat/completions
API Key: sk-or-xxx...
Model Name: anthropic/claude-3.5-sonnet
```

**說明**:
- 關閉自動補全，使用完整 URL
- 使用 Claude 的 metaprompt，但通過 OpenAI 格式調用
- 適合大多數代理服務

---

### 場景 D: 自建 API 服務

```
Optimizer Type: GPT-5 Prompt Optimizer
API Format: OpenAI Format
Auto-complete: ✗ (關閉)
API Path: https://your-api.example.com/api/completions
API Key: your-custom-key
Model Name: your-model-name
```

**說明**:
- 完全自定義的 API 端點
- 只要服務兼容 OpenAI Chat Completions 格式即可

---

## 🎯 優化器類型對比 / Optimizer Comparison

### Claude Prompt Optimizer

**Metaprompt 特點**:
- 使用 XML 標籤結構
- 強調變量命名 (`{$VARIABLE}`)
- 分三步驟: `<Inputs>` → `<Instructions Structure>` → `<Instructions>`
- 適合複雜任務，支持 scratchpad 思考

**適用場景**:
- 需要複雜變量替換的提示詞
- 多步驟任務
- 需要結構化輸出的場景
- 使用 Claude 模型時

**輸出格式示例**:
```
<Inputs>
{$USER_INPUT}
{$CONTEXT}
</Inputs>

<Instructions>
You will analyze the user input...
[詳細指令]
</Instructions>

[純文本版本]
```

---

### GPT-5 Prompt Optimizer

**Metaprompt 特點**:
- 使用 Markdown 結構 (# ROLE, # TASK, # RULES)
- 清晰的指令層級
- 專注於 GPT-5 最佳實踐
- 強調明確性和無歧義性

**適用場景**:
- 使用 GPT 系列模型時
- 需要清晰角色定義的任務
- 規則密集型提示詞
- 標準化輸出格式

**輸出格式示例**:
```
# ROLE
You are an expert...

# TASK
Analyze the following...

# RULES
- Rule 1
- Rule 2

# OUTPUT FORMAT
Provide response in...

[純文本版本]
```

---

## 🔧 API 格式對比 / API Format Comparison

### OpenAI Format

**端點**: `/chat/completions`

**請求格式**:
```json
{
  "model": "model-name",
  "messages": [
    {"role": "user", "content": "..."}
  ],
  "temperature": 0.7
}
```

**認證**: `Authorization: Bearer ${apiKey}`

**兼容服務**:
- OpenAI API
- OpenRouter
- one-api
- vLLM
- 大部分代理服務

---

### Anthropic Format

**端點**: `/v1/messages`

**請求格式**:
```json
{
  "model": "model-name",
  "max_tokens": 4096,
  "messages": [
    {"role": "user", "content": "..."}
  ],
  "temperature": 0.7
}
```

**認證**: `x-api-key: ${apiKey}` + `anthropic-version: 2023-06-01`

**特殊功能**:
- 支持 assistant prefill (Claude 模式時自動使用)
- 原生 Anthropic API 專用

---

## 💡 高級技巧 / Advanced Tips

### 1. 混合使用策略

您可以:
- **Claude Optimizer + OpenAI Format**: 使用 Claude 的優化方法，但通過代理服務調用
- **GPT-5 Optimizer + Anthropic Format**: 使用 GPT-5 的優化方法，調用 Claude 模型

### 2. URL 自動補全的使用時機

**應該開啟**:
- 使用標準 API (OpenAI/Anthropic)
- API 路徑只填寫到域名 (如 `https://api.openai.com/v1`)

**應該關閉**:
- 使用代理服務 (URL 已包含完整路徑)
- 使用自建服務 (自定義端點)
- API 路徑已經是完整的 (如 `https://xxx.com/v1/chat/completions`)

### 3. 模型名稱提示

程序會根據您選擇的優化器類型，在模型名稱輸入框下方顯示建議:
- **Claude**: `claude-3-5-sonnet-20240620`, `claude-3-opus-20240229`
- **GPT**: `gpt-4`, `gpt-3.5-turbo`, `gpt-4-turbo`

但您可以輸入任何模型名稱，只要您的 API 服務支持。

### 4. 語言自動檢測

無論選擇哪種優化器，程序都會:
1. 自動檢測您輸入的提示詞語言
2. 要求優化器用相同語言輸出
3. 除非您勾選「Force English Output」（強制英文輸出）

---

## 🐛 故障排除 / Troubleshooting

### 問題: API 請求失敗

**檢查清單**:
1. ✅ API Key 是否正確
2. ✅ API Format 是否與服務匹配
3. ✅ URL 自動補全設置是否正確
4. ✅ 模型名稱是否正確
5. ✅ 查看瀏覽器控制台錯誤信息

### 問題: 優化結果格式不對

**可能原因**:
- 優化器類型與模型不匹配
- 模型輸出不符合預期格式

**解決方案**:
- 嘗試切換優化器類型
- 檢查模型是否支持複雜提示詞

### 問題: URL 自動補全添加了重複路徑

**解決方案**:
- 關閉 URL 自動補全
- 或者在 API Path 中只填寫基礎 URL

---

## 📚 實用示例 / Practical Examples

### 示例 1: 優化技術文檔生成提示詞

**原始提示詞**:
```
幫我寫技術文檔
```

**使用 GPT-5 Optimizer 後**:
```
# ROLE
You are a technical documentation specialist with expertise in creating clear, comprehensive, and well-structured documentation.

# TASK
Generate technical documentation based on the user's requirements, ensuring accuracy, clarity, and appropriate technical depth.

# RULES
- Use precise technical terminology
- Include code examples where appropriate
- Follow industry best practices for documentation structure
- Maintain consistent formatting throughout
- Provide clear explanations for complex concepts

# OUTPUT FORMAT
Provide the documentation in Markdown format with:
1. Title and overview
2. Detailed sections with headings
3. Code examples in fenced code blocks
4. Clear section transitions
```

---

### 示例 2: 優化客服對話提示詞

**原始提示詞**:
```
你是客服，幫助用戶解決問題
```

**使用 Claude Optimizer 後**:
```
<Inputs>
{$USER_QUESTION}
{$KNOWLEDGE_BASE}
</Inputs>

You will be acting as a customer support agent. When the user provides their question, you will help them find a solution based on the knowledge base.

Here is the knowledge base you should reference:
<knowledge_base>
{$KNOWLEDGE_BASE}
</knowledge_base>

Here is the user's question:
<question>
{$USER_QUESTION}
</question>

Instructions:
1. First, search the knowledge base for relevant information
2. If you find a solution, explain it clearly and concisely
3. If you don't find a solution, politely let the user know and suggest contacting human support
4. Always be courteous and professional
5. Ask clarifying questions if the user's question is unclear

Provide your response inside <answer> tags.
```

---

## 🎓 最佳實踐 / Best Practices

### 1. 選擇合適的優化器

- **Claude Optimizer**: 適合需要複雜變量替換和結構化輸入的場景
- **GPT-5 Optimizer**: 適合需要明確角色定義和規則的場景

### 2. 利用優化參數

調整側邊欄的優化參數以獲得更好的結果:
- **Accuracy** (準確度): 提高以獲得更詳細的指令
- **Brevity** (簡潔度): 提高以獲得更簡潔的輸出
- **Creativity** (創造力): 根據任務需求調整
- **Safety** (安全性): 提高以增加安全約束

### 3. 使用行為配置

在「Behavior Configuration」中:
- **Desired Behavior**: 描述期望的行為
- **Undesired Behavior**: 描述要避免的行為

這些會被整合到 metaprompt 中，幫助生成更符合需求的優化提示詞。

### 4. 利用歷史記錄

- 每次優化都會自動保存到歷史記錄
- 可以快速載入之前的優化結果
- 使用「Reuse」功能可以對優化結果進行二次優化

---

## 💬 需要幫助？ / Need Help?

如果您遇到問題或有建議，請:
1. 查看 CHANGELOG.md 了解最新功能
2. 查看瀏覽器控制台錯誤信息
3. 確認 API 服務狀態
4. 嘗試不同的配置組合

祝您使用愉快！🎉

