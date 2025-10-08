-- 添加開發者標籤欄位到 profiles 表
-- 執行日期: 2025-10-08

-- 添加 is_developer 欄位，預設為 false
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_developer BOOLEAN DEFAULT false;

-- 添加註釋說明
COMMENT ON COLUMN profiles.is_developer IS '開發者標籤：標記為 true 的用戶可以使用開發者工具';

-- 創建索引以提高查詢效率（可選）
CREATE INDEX IF NOT EXISTS idx_profiles_is_developer 
ON profiles(is_developer) 
WHERE is_developer = true;

-- 範例：將特定用戶設為開發者（請根據實際需求修改）
-- UPDATE profiles SET is_developer = true WHERE username = 'your_username';

