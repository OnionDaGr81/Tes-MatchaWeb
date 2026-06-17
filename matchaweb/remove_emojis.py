import os
import re

html_dir = r"D:\Tes-MatchaWeb\matchaweb\src\main\resources\public"

# Define the emojis to remove
emojis = [
    "🔙 ", "👤 ", "🚪 ", "🏠 ", "👥 ", "📅 ", "🔔 ", "💳 ", "⭐ ", "📁 ", 
    "📍 ", "🔒 ", "🎯 ", "⚙️ ", "⚠️ "
]

for root, dirs, files in os.walk(html_dir):
    for file in files:
        if file.endswith(".html"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            for emoji in emojis:
                new_content = new_content.replace(emoji, "")
                
            # Specifically remove the empty avatar emoji
            new_content = new_content.replace('<div class="profile-avatar" id="profile-avatar">👤</div>', '<div class="profile-avatar" id="profile-avatar">U</div>')
            new_content = new_content.replace('<div class="profile-avatar" id="profile-avatar"></div>', '<div class="profile-avatar" id="profile-avatar">U</div>')
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Removed emojis from {file}")
