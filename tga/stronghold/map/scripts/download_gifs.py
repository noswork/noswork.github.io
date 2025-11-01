#!/usr/bin/env python3
"""
Copyright © 2025 nos
All Rights Reserved.

未經授權，禁止使用、複製、修改或分發本代碼。
Unauthorized copying, modification, or distribution is strictly prohibited.

Contact: discord: noswork
"""

"""
從巴哈姆特論壇抓取並下載 Tokyo Ghoul GIF 圖片
"""

import re
import os
import json
import time
from urllib.request import urlopen, Request, urlretrieve
from urllib.error import URLError, HTTPError
from html.parser import HTMLParser

class ImgurLinkParser(HTMLParser):
    """解析 HTML 中的 Imgur 連結"""
    def __init__(self):
        super().__init__()
        self.imgur_links = []
        
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            for attr, value in attrs:
                if attr == 'src' and 'imgur.com' in value:
                    # 確保是 .gif 或可以轉換為 .gif
                    if '.gif' in value or '//' in value:
                        # 規範化 URL
                        if value.startswith('//'):
                            value = 'https:' + value
                        elif not value.startswith('http'):
                            value = 'https://' + value
                        
                        # 確保是 GIF 格式
                        if '.gif' in value or 'i.imgur.com' in value:
                            self.imgur_links.append(value)

def fetch_page(url, retries=3, delay=2):
    """抓取網頁內容"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for attempt in range(retries):
        try:
            req = Request(url, headers=headers)
            with urlopen(req, timeout=10) as response:
                return response.read().decode('utf-8', errors='ignore')
        except (URLError, HTTPError) as e:
            print(f"❌ 抓取失敗 (嘗試 {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(delay)
    
    return None

def extract_imgur_gifs(html_content):
    """從 HTML 中提取 Imgur GIF 連結"""
    if not html_content:
        return []
    
    parser = ImgurLinkParser()
    try:
        parser.feed(html_content)
    except Exception as e:
        print(f"❌ 解析 HTML 時出錯: {e}")
    
    # 使用正則表達式作為備份方法
    regex_pattern = r'https?://i\.imgur\.com/[a-zA-Z0-9]+\.gif'
    regex_matches = re.findall(regex_pattern, html_content)
    
    # 合併兩種方法的結果
    all_links = list(set(parser.imgur_links + regex_matches))
    
    # 確保所有連結都是 .gif 格式
    gif_links = []
    for link in all_links:
        if '.gif' in link:
            gif_links.append(link)
        elif 'i.imgur.com' in link and not any(ext in link for ext in ['.jpg', '.jpeg', '.png']):
            # 如果是 imgur 連結但沒有副檔名，嘗試添加 .gif
            if not link.endswith('.gif'):
                gif_links.append(link + '.gif' if '?' not in link else link.split('?')[0] + '.gif')
            else:
                gif_links.append(link)
    
    return list(set(gif_links))  # 去重

def download_gif(url, output_dir, filename=None):
    """下載單個 GIF 檔案"""
    try:
        if filename is None:
            # 從 URL 中提取檔名
            filename = url.split('/')[-1].split('?')[0]
            if not filename.endswith('.gif'):
                filename += '.gif'
        
        output_path = os.path.join(output_dir, filename)
        
        # 如果檔案已存在，跳過
        if os.path.exists(output_path):
            print(f"⏭️  已存在: {filename}")
            return True
        
        # 下載檔案
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        req = Request(url, headers=headers)
        
        print(f"⬇️  下載中: {filename}")
        with urlopen(req, timeout=30) as response:
            with open(output_path, 'wb') as f:
                f.write(response.read())
        
        print(f"✅ 完成: {filename}")
        return True
        
    except Exception as e:
        print(f"❌ 下載失敗 ({filename}): {e}")
        return False

def main():
    """主程序"""
    print("🎬 Tokyo Ghoul GIF 下載工具")
    print("=" * 50)
    
    # 目標 URL
    urls = [
        "https://forum.gamer.com.tw/C.php?bsn=45101&snA=228",
        "https://forum.gamer.com.tw/C.php?page=2&bsn=45101&snA=228"
    ]
    
    # 創建輸出目錄
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_dir = os.path.join(project_root, 'assets', 'loading-gifs')
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"📁 輸出目錄: {output_dir}")
    print()
    
    # 收集所有 GIF 連結
    all_gif_links = []
    
    for i, url in enumerate(urls, 1):
        print(f"📄 正在抓取第 {i} 頁...")
        html = fetch_page(url)
        
        if html:
            gif_links = extract_imgur_gifs(html)
            print(f"✅ 找到 {len(gif_links)} 個 GIF 連結")
            all_gif_links.extend(gif_links)
        else:
            print(f"❌ 無法抓取第 {i} 頁")
        
        print()
        time.sleep(1)  # 避免請求過快
    
    # 去重
    all_gif_links = list(set(all_gif_links))
    print(f"🎯 總共找到 {len(all_gif_links)} 個唯一的 GIF 連結")
    print()
    
    # 保存連結列表到 JSON
    json_path = os.path.join(project_root, 'data', 'tokyo-ghoul-gifs.json')
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(all_gif_links, f, indent=2, ensure_ascii=False)
    
    print(f"💾 連結列表已保存: {json_path}")
    print()
    
    # 下載所有 GIF
    print(f"⬇️  開始下載 {len(all_gif_links)} 個 GIF...")
    print()
    
    success_count = 0
    fail_count = 0
    
    for i, url in enumerate(all_gif_links, 1):
        print(f"[{i}/{len(all_gif_links)}]", end=" ")
        
        if download_gif(url, output_dir):
            success_count += 1
        else:
            fail_count += 1
        
        # 避免請求過快
        if i % 10 == 0:
            time.sleep(2)
        else:
            time.sleep(0.5)
    
    print()
    print("=" * 50)
    print(f"✅ 成功: {success_count} 個")
    print(f"❌ 失敗: {fail_count} 個")
    print(f"📁 GIF 保存在: {output_dir}")
    print(f"📄 連結列表: {json_path}")
    
    # 創建索引文件
    downloaded_files = [f for f in os.listdir(output_dir) if f.endswith('.gif')]
    index_path = os.path.join(project_root, 'data', 'gif-index.json')
    
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(sorted(downloaded_files), f, indent=2, ensure_ascii=False)
    
    print(f"📋 索引文件已創建: {index_path}")
    print(f"🎬 共有 {len(downloaded_files)} 個 GIF 可用")

if __name__ == '__main__':
    main()

