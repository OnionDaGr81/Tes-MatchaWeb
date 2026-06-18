import os
import re

PUBLIC_DIR = r"D:\Tes-MatchaWeb\matchaweb\src\main\resources\public"
JS_PAGES_DIR = os.path.join(PUBLIC_DIR, "js", "pages")

PAGES = {
    'dashboard-client': 'dashboard-client.html',
    'dashboard-talent': 'dashboard-talent.html',
    'catalog': 'catalog.html',
    'my-bookings': 'my-bookings.html',
    'notifications': 'notifications.html',
    'profile': 'profile.html',
}

def clean_script_for_spa(script_content, init_func_name):
    # Remove the theme logic and logout logic as it's now global
    script_content = re.sub(r'function toggleTheme\(\)\s*\{.*?\}(?:\s*document\.documentElement\.setAttribute[^\n]+)?', '', script_content, flags=re.DOTALL)
    script_content = re.sub(r'function logout\(\)\s*\{.*?\}', '', script_content, flags=re.DOTALL)
    
    # Replace DOMContentLoaded with init function
    script_content = re.sub(r'document\.addEventListener\([\'"]DOMContentLoaded[\'"]\s*,\s*\(\)\s*=>\s*\{', f'window.{init_func_name} = function() {{', script_content)
    
    # If the file had no DOMContentLoaded, just wrap it anyway or hope for the best
    return script_content

def process_file(key, filename):
    filepath = os.path.join(PUBLIC_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract page-content
    match = re.search(r'<div class="page-content">(.*?)</div>\s*(?:</main>|<!-- Modal)', content, re.DOTALL)
    page_content = match.group(1).strip() if match else f"<!-- NOT FOUND IN {filename} -->"
    
    # Extract modals
    modal_matches = re.finditer(r'(<div[^>]*class="[^"]*modal[^"]*"[^>]*>.*?</div>\s*</div>)', content, re.DOTALL)
    modals = "\n".join(m.group(1) for m in modal_matches)
    
    # Extract trailing script if any (excluding external src)
    script_match = re.search(r'<script>(?!.*(?:toggleTheme|AuthManager))?(.*?)</script>\s*</body>', content, re.DOTALL)
    script_content = script_match.group(1).strip() if script_match else ""
    
    init_func_name = 'init_' + key.replace('-', '_')
    
    if script_content:
        # It's an inline script in HTML, save to js/pages/
        cleaned_script = clean_script_for_spa(script_content, init_func_name)
        js_path = os.path.join(JS_PAGES_DIR, f"{key}.js")
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_script)
            
    # Also if there's an existing JS file, rewrite it
    existing_js_path = os.path.join(JS_PAGES_DIR, f"{key}.js")
    if os.path.exists(existing_js_path):
        with open(existing_js_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            if f'window.{init_func_name}' not in js_content:
                js_content = clean_script_for_spa(js_content, init_func_name)
                with open(existing_js_path, 'w', encoding='utf-8') as f2:
                    f2.write(js_content)
                    
    return page_content, modals

sections = []
all_modals = []
scripts_to_include = []

for key, filename in PAGES.items():
    filepath = os.path.join(PUBLIC_DIR, filename)
    if os.path.exists(filepath):
        html, modals = process_file(key, filename)
        sections.append(f'<section id="view-{key}" class="view-section">\n{html}\n</section>')
        if modals:
            all_modals.append(f'<!-- MODALS FOR {key} -->\n{modals}')
        
        js_path = os.path.join(JS_PAGES_DIR, f"{key}.js")
        if os.path.exists(js_path):
            scripts_to_include.append(f'<script src="/js/pages/{key}.js"></script>')

app_js_content = """
class Router {
    static init() {
        if (!AuthManager.requireLogin()) return;
        
        const user = AuthManager.getUser();
        this.renderSidebar(user.role.toLowerCase());
        
        // Initial route
        const hash = window.location.hash.replace('#', '') || (user.role.toLowerCase() === 'talent' ? 'dashboard-talent' : 'dashboard-client');
        this.navigate(hash);
    }
    
    static renderSidebar(role) {
        const nav = document.getElementById('sidebar-nav-container');
        let html = '';
        
        if (role === 'client') {
            html += `<div class="sidebar-link" data-route="dashboard-client" onclick="Router.navigate('dashboard-client')">🏠 Dashboard</div>`;
            html += `<div class="sidebar-link" data-route="catalog" onclick="Router.navigate('catalog')">🔍 Katalog Talent</div>`;
        } else {
            html += `<div class="sidebar-link" data-route="dashboard-talent" onclick="Router.navigate('dashboard-talent')">🏠 Dashboard</div>`;
        }
        
        html += `<div class="sidebar-link" data-route="my-bookings" onclick="Router.navigate('my-bookings')">📅 Booking Saya</div>`;
        html += `<div class="sidebar-link" data-route="notifications" onclick="Router.navigate('notifications')">🔔 Notifikasi</div>`;
        html += `<div class="sidebar-link" data-route="profile" onclick="Router.navigate('profile')">👤 Profil</div>`;
        
        nav.innerHTML = html;
    }
    
    static navigate(route) {
        // Update hash
        window.location.hash = route;
        
        // Hide all
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
        
        // Show target
        const targetView = document.getElementById(`view-${route}`);
        if (targetView) targetView.classList.add('active');
        
        // Update active link
        const targetLink = document.querySelector(`.sidebar-link[data-route="${route}"]`);
        if (targetLink) targetLink.classList.add('active');
        
        // Update title
        const titles = {
            'dashboard-client': 'Dashboard',
            'dashboard-talent': 'Dashboard Talent',
            'catalog': 'Katalog Talent',
            'my-bookings': 'Booking Saya',
            'notifications': 'Notifikasi',
            'profile': 'Profil Saya'
        };
        document.getElementById('page-title').innerText = titles[route] || 'Matcha';
        
        // Execute init script
        const initFuncName = 'init_' + route.replace('-', '_');
        if (typeof window[initFuncName] === 'function') {
            window[initFuncName]();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('matcha_theme', newTheme);
}
document.documentElement.setAttribute('data-theme', localStorage.getItem('matcha_theme') || 'dark');

function logout() {
    AuthManager.logout();
    window.location.href = '/login.html';
}
"""

with open(os.path.join(PUBLIC_DIR, 'js', 'app.js'), 'w', encoding='utf-8') as f:
    f.write(app_js_content)

app_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matcha Companion</title>
    <link rel="stylesheet" href="/css/global.css">
    <style>
        .view-section {{ display: none; animation: fadeIn 0.3s ease-in-out; }}
        .view-section.active {{ display: block; }}
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(10px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">🍵 Matcha<span>Companion</span></div>
            </div>
            <div class="sidebar-nav" id="sidebar-nav-container">
                <!-- Links injected by JS -->
            </div>
            <div class="sidebar-footer">
                <button class="btn btn-outline btn-block" onclick="toggleTheme()" style="margin-bottom: 10px;">🌓 Ganti Tema</button>
                <button class="btn btn-danger btn-block" onclick="logout()">Keluar</button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="top-header">
                <h3 id="page-title" style="margin: 0; color: var(--text-primary);">Dashboard</h3>
                <div class="user-greeting" id="nav-greeting" style="color: var(--text-secondary); font-size: 14px;"></div>
            </header>
            
            <div class="page-content" id="app-content">
                {"\n\n".join(sections)}
            </div>
        </main>
    </div>

    <!-- Modals -->
    {"\n\n".join(all_modals)}

    <!-- Scripts -->
    <script src="/js/services/api.js"></script>
    <script src="/js/utils/helpers.js"></script>
    <script src="/js/app.js"></script>
    {"\n    ".join(scripts_to_include)}
</body>
</html>
"""

with open(os.path.join(PUBLIC_DIR, 'app.html'), 'w', encoding='utf-8') as f:
    f.write(app_html)

print("Generated app.html and app.js")
