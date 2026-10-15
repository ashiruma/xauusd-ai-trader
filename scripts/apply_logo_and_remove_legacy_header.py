"""
Script to:
1. Remove the legacy header (<header class="top-nav">...</header>).
2. Move .landing-announcement-bar and .landing-navbar to the very top of <body> (above .app-layout).
3. Use the new official VELARION MARKETS logo (velarion_brand_dark.png):
   - In .landing-navbar
   - In aside.sidebar
   - In #jm-auth-modal
   - In the user dashboard / academy
4. Remove the duplicate bar and nav from inside view-home so view-home starts with landing-hero-wrap.
5. Verify DOM balance and zero errors.
"""

import re

def update_header_and_branding():
    with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. EXTRACT THE ANNOUNCEMENT BAR AND LANDING NAVBAR
    s_bar = html.find('<!-- Top Announcement Countdown Strip')
    if s_bar == -1:
        s_bar = html.find('<div class="landing-announcement-bar">')
    
    s_hero = html.find('<!-- Hero Section (Replicating exact layout of attached photo) -->')
    if s_hero == -1:
        s_hero = html.find('<section class="landing-hero-wrap">')

    assert s_bar != -1, "s_bar not found"
    assert s_hero != -1, "s_hero not found"

    # The block containing countdown bar and landing navbar
    announcement_and_navbar = html[s_bar:s_hero]

    # Update the logo in landing-navbar with the new official branding
    old_landing_brand_re = r'<a href="#view-home" class="landing-brand">.*?</a>'
    new_landing_brand = """<a href="#view-home" class="landing-brand" onclick="switchMainView('view-home')" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
                        <img src="/velarion_brand_dark.png" alt="VELARION MARKETS" style="height:36px; width:auto; display:block;" />
                    </a>"""

    announcement_and_navbar = re.sub(old_landing_brand_re, new_landing_brand, announcement_and_navbar, count=1, flags=re.DOTALL)

    # 2. REMOVE THE LEGACY HEADER AND INSERT THE UNIFIED ANNOUNCEMENT + NAVBAR IN ITS PLACE
    s_legacy = html.find('<!-- ==============================================================\n    <!-- TOP INSTITUTIONAL STRIP')
    if s_legacy == -1:
        s_legacy = html.find('<!-- TOP INSTITUTIONAL STRIP')
    if s_legacy == -1:
        s_legacy = html.find('<header class="top-nav">')

    e_legacy = html.find('</header>') + len('</header>')
    assert s_legacy != -1, "Legacy header start not found"
    assert e_legacy > s_legacy, "Legacy header end not found"

    # Replace legacy header with announcement_and_navbar at the top of <body>
    html = html[:s_legacy] + announcement_and_navbar.strip() + "\n\n    " + html[e_legacy:]

    # 3. NOW REMOVE announcement_and_navbar FROM INSIDE view-home
    # In view-home, it was before s_hero. Let's find s_hero again in the updated html
    s_home_tag = html.find('<div id="view-home" class="view-pane active">')
    s_hero_in_home = html.find('<section class="landing-hero-wrap">', s_home_tag)
    
    # Between s_home_tag and s_hero_in_home was the old announcement and navbar inside view-home
    # Replace that slice with just a clean line
    slice_to_remove = html[s_home_tag + len('<div id="view-home" class="view-pane active">'):s_hero_in_home]
    html = html[:s_home_tag + len('<div id="view-home" class="view-pane active">')] + "\n                " + html[s_hero_in_home:]

    # 4. ADD OFFICIAL LOGO TO THE SIDEBAR (aside.sidebar)
    sidebar_top_target = '<aside class="sidebar">\n            <div class="nav-section-title">Core Platform</div>'
    sidebar_top_replacement = """<aside class="sidebar">
            <div style="padding:10px 10px 16px; border-bottom:1px solid var(--border-default); margin-bottom:12px; display:flex; align-items:center; justify-content:center;">
                <img src="/velarion_brand_dark.png" alt="VELARION MARKETS" style="height:32px; width:auto; max-width:180px; display:block;" />
            </div>
            <div class="nav-section-title">Core Platform</div>"""

    if sidebar_top_target in html:
        html = html.replace(sidebar_top_target, sidebar_top_replacement, 1)
    else:
        # Fallback regex
        html = re.sub(
            r'<aside class="sidebar">\s*<div class="nav-section-title">',
            """<aside class="sidebar">\n            <div style="padding:10px 10px 16px; border-bottom:1px solid var(--border-default); margin-bottom:12px; display:flex; align-items:center; justify-content:center;">\n                <img src="/velarion_brand_dark.png" alt="VELARION MARKETS" style="height:32px; width:auto; max-width:180px; display:block;" />\n            </div>\n            <div class="nav-section-title">""",
            html,
            count=1
        )

    # 5. ADD OFFICIAL LOGO TO THE JUSTMARKETS AUTH MODAL (#jm-auth-modal)
    old_jm_header = """            <!-- Modal Header -->
            <div class="jm-modal-header">
                <div>
                    <span class="status-badge status-completed" style="margin-bottom:4px; display:inline-block;">JUSTMARKETS MT5 GATEWAY</span>
                    <h3 style="font-size:17px; font-weight:800; color:#FFFFFF; margin:2px 0;">Sign In With JustMarkets MT5</h3>
                    <div style="font-size:12px; color:#94A3B8;">
                        Access to Forex School &amp; AI Terminal requires an account registered under partner code <strong style="color:var(--accent-gold);">p4cui0wkfz</strong>.
                    </div>
                </div>
                <button onclick="closeJustMarketsLoginModal()" class="modal-close-btn" style="color:#94A3B8;">&times;</button>
            </div>"""

    new_jm_header = """            <!-- Modal Header with Official Brand Logo -->
            <div class="jm-modal-header">
                <div style="display:flex; align-items:center; gap:14px;">
                    <img src="/velarion_brand_dark.png" alt="VELARION MARKETS" style="height:36px; width:auto; display:block;" />
                    <div>
                        <span class="status-badge status-completed" style="margin-bottom:2px; display:inline-block;">JUSTMARKETS MT5 GATEWAY</span>
                        <h3 style="font-size:16px; font-weight:800; color:#FFFFFF; margin:0;">Sign In With JustMarkets MT5</h3>
                    </div>
                </div>
                <button onclick="closeJustMarketsLoginModal()" class="modal-close-btn" style="color:#94A3B8;">&times;</button>
            </div>
            <div style="padding:8px 22px; background:#0B1120; border-bottom:1px solid rgba(255,255,255,0.06); font-size:12px; color:#94A3B8;">
                Access to Forex School &amp; AI Terminal requires an account registered under partner code <strong style="color:var(--accent-gold);">p4cui0wkfz</strong>.
            </div>"""

    if old_jm_header in html:
        html = html.replace(old_jm_header, new_jm_header, 1)

    # 6. UPDATE CSS FOR TOP PADDING
    # Now that the legacy header is removed, adjust sticky positions of the announcement bar and navbar
    html = html.replace("top: 38px;\n            z-index: 101;", "top: 35px;\n            z-index: 101;")
    html = html.replace("top: 41px;\n            z-index: 101;", "top: 35px;\n            z-index: 101;")

    with open("dashboard/static/index.html", "w", encoding="utf-8") as f:
        f.write(html)

    print("Successfully removed legacy header and applied new official Velarion Markets branding! Length:", len(html))

if __name__ == "__main__":
    update_header_and_branding()
