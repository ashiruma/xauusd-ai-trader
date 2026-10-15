import urllib.request
import json

resp = urllib.request.urlopen('http://127.0.0.1:8000/')
print('HTTP status:', resp.status)
content = resp.read().decode('utf-8')
print('Length:', len(content))
print('Has view-home active:', 'id="view-home" class="view-pane active"' in content)
print('Has Spot Gold locked pip card:', '<span>Spot Gold (XAUUSD)</span>' in content and '100 OZ CONTRACT' in content)
print('Has FX pair select dropdown:', '<select id="pip-asset"' in content)
print('Has onboarding 2-col layout:', 'grid-template-columns:1fr 380px' in content)
print('Has partner code p4cui0wkfz:', 'p4cui0wkfz' in content)
print('Has admin portal view:', 'id="view-admin"' in content)
print('Has user dashboard view:', 'id="view-user-dashboard"' in content)

# Check user registered via api
req = urllib.request.Request('http://127.0.0.1:8000/api/users/register',
    data=json.dumps({
        "full_name": "Marcus Aurelius",
        "email": "marcus.aurelius@velarion.io",
        "justmarkets_account_id": "1200533810",
        "server": "JustForex-Live",
        "referral_code": "p4cui0wkfz"
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'})

try:
    reg_resp = urllib.request.urlopen(req)
    reg_data = json.loads(reg_resp.read().decode('utf-8'))
    print("Registered user response:", reg_data)
except Exception as e:
    print("User register error:", e)

# Fetch user dashboard data
try:
    me_resp = urllib.request.urlopen('http://127.0.0.1:8000/api/users/me?account_id=1200533810')
    me_data = json.loads(me_resp.read().decode('utf-8'))
    print("User me response:", me_data)
except Exception as e:
    print("User me error:", e)

# Fetch admin users
try:
    admin_resp = urllib.request.urlopen('http://127.0.0.1:8000/api/admin/users')
    admin_data = json.loads(admin_resp.read().decode('utf-8'))
    print("Admin users count:", len(admin_data))
    for u in admin_data[:3]:
        print(f" - Trader: {u['full_name']} | MT5: {u['justmarkets_account_id']} | Verified: {u['is_referral_verified']} | Code: {u['referral_code']}")
except Exception as e:
    print("Admin users error:", e)
