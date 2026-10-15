import re

with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update all default link occurrences to the primary link https://one.justmarkets.link/a/tohstb0d83
content = content.replace('https://one.justmarkets.link/a/p4cui0wkfz', 'https://one.justmarkets.link/a/tohstb0d83')

# 2. Update default data-partner-code instances in markup
content = re.sub(r'data-partner-code="true">p4cui0wkfz<', 'data-partner-code="true">tohstb0d83<', content)
content = re.sub(r'value="p4cui0wkfz"', 'value="tohstb0d83"', content)
content = re.sub(r'placeholder="e\.g\. p4cui0wkfz"', 'placeholder="e.g. tohstb0d83"', content)

# 3. Update JavaScript variables and sync logic
old_js_vars = """let cachedAdminUsers = [];
        let currentAdminFilter = 'all';
        let currentPartnerCode = 'p4cui0wkfz';
        let currentPartnerLink = 'https://one.justmarkets.link/a/p4cui0wkfz';"""

new_js_vars = """let cachedAdminUsers = [];
        let currentAdminFilter = 'all';
        let currentPartnerCode = 'tohstb0d83';
        let currentPartnerLink = 'https://one.justmarkets.link/a/tohstb0d83';
        let currentSecondaryCode = 'p4cui0wkfz';
        let currentSecondaryLink = 'https://one.justmarkets.link/a/p4cui0wkfz';
        let partnerDripActive = false;"""

if old_js_vars in content:
    content = content.replace(old_js_vars, new_js_vars)
else:
    print("Warning: old_js_vars not matched directly")

# 4. Update syncPartnerConfigGlobally to handle drip metrics
old_sync = """        async function syncPartnerConfigGlobally() {
            try {
                const res = await fetch('/api/partner/config');
                const cfg = await res.json();
                if (cfg) {
                    if (cfg.referral_code) currentPartnerCode = cfg.referral_code;
                    if (cfg.referral_link) currentPartnerLink = cfg.referral_link;

                    const inpCode = document.getElementById('partner-cfg-code');
                    const inpLink = document.getElementById('partner-cfg-link');
                    if (inpCode && !inpCode.value) inpCode.value = currentPartnerCode;
                    if (inpLink && !inpLink.value) inpLink.value = currentPartnerLink;

                    const promoInp = document.getElementById('partner-link-input');
                    if (promoInp) promoInp.value = currentPartnerLink;

                    const jmRegCode = document.getElementById('jm-input-reg-code');
                    if (jmRegCode) jmRegCode.value = currentPartnerCode;
                    const regFormRef = document.getElementById('reg-form-refcode');
                    if (regFormRef && !regFormRef.value) regFormRef.value = currentPartnerCode;

                    // Update all dynamic partner links across the DOM
                    document.querySelectorAll('a[data-partner-link="true"]').forEach(a => {
                        a.href = currentPartnerLink;
                    });
                    document.querySelectorAll('[data-partner-code="true"]').forEach(el => {
                        el.innerText = currentPartnerCode;
                    });
                }
            } catch(e) {}
        }"""

new_sync = """        async function syncPartnerConfigGlobally() {
            try {
                const res = await fetch('/api/partner/config');
                const cfg = await res.json();
                if (cfg) {
                    currentPartnerCode = cfg.active_code || cfg.primary_code || cfg.referral_code || 'tohstb0d83';
                    currentPartnerLink = cfg.active_link || cfg.primary_link || cfg.referral_link || 'https://one.justmarkets.link/a/tohstb0d83';
                    currentSecondaryCode = cfg.secondary_code || 'p4cui0wkfz';
                    currentSecondaryLink = cfg.secondary_link || 'https://one.justmarkets.link/a/p4cui0wkfz';
                    partnerDripActive = Boolean(cfg.is_drip_active);

                    const pCode = cfg.primary_code || 'tohstb0d83';
                    const pLink = cfg.primary_link || 'https://one.justmarkets.link/a/tohstb0d83';
                    const pLimit = Number(cfg.primary_limit || 10);
                    const pCount = Number(cfg.primary_count || 0);
                    const sCount = Number(cfg.secondary_count || 0);

                    // Form inputs
                    const inpCode = document.getElementById('partner-cfg-code');
                    const inpLink = document.getElementById('partner-cfg-link');
                    if (inpCode) inpCode.value = currentPartnerCode;
                    if (inpLink) inpLink.value = currentPartnerLink;

                    const pInpCode = document.getElementById('partner-cfg-primary-code');
                    const pInpLink = document.getElementById('partner-cfg-primary-link');
                    const pInpLimit = document.getElementById('partner-cfg-primary-limit');
                    if (pInpCode) pInpCode.value = pCode;
                    if (pInpLink) pInpLink.value = pLink;
                    if (pInpLimit) pInpLimit.value = pLimit;

                    const sInpCode = document.getElementById('partner-cfg-secondary-code');
                    const sInpLink = document.getElementById('partner-cfg-secondary-link');
                    if (sInpCode) sInpCode.value = currentSecondaryCode;
                    if (sInpLink) sInpLink.value = currentSecondaryLink;

                    const promoInp = document.getElementById('partner-link-input');
                    if (promoInp) promoInp.value = currentPartnerLink;

                    const jmRegCode = document.getElementById('jm-input-reg-code');
                    if (jmRegCode) jmRegCode.value = currentPartnerCode;
                    const regFormRef = document.getElementById('reg-form-refcode');
                    if (regFormRef && !regFormRef.value) regFormRef.value = currentPartnerCode;

                    // Telemetry display updates
                    const elDripPill = document.getElementById('partner-cfg-drip-pill');
                    if (elDripPill) {
                        if (partnerDripActive) {
                            elDripPill.innerText = 'DRIP-DOWN ACTIVE -> SECONDARY LINK (' + currentSecondaryCode + ')';
                            elDripPill.style.background = 'rgba(25,184,120,0.18)';
                            elDripPill.style.color = 'var(--accent-green)';
                        } else {
                            elDripPill.innerText = 'PRIMARY ACTIVE (' + (pLimit - pCount) + ' SLOTS REMAINING)';
                            elDripPill.style.background = 'rgba(230,187,89,0.15)';
                            elDripPill.style.color = 'var(--accent-gold)';
                        }
                    }

                    const elSlotsText = document.getElementById('partner-cfg-primary-slots-text');
                    if (elSlotsText) {
                        elSlotsText.innerText = pCount + ' / ' + pLimit + ' Partners Filled' + (partnerDripActive ? ' [CAP REACHED]' : '');
                    }

                    const elDripBar = document.getElementById('partner-cfg-drip-bar');
                    if (elDripBar) {
                        const pct = Math.min(100, Math.round((pCount / pLimit) * 100));
                        elDripBar.style.width = pct + '%';
                        if (partnerDripActive) {
                            elDripBar.style.background = 'var(--accent-green)';
                        }
                    }

                    const elRoutingStatus = document.getElementById('partner-cfg-active-routing-status');
                    if (elRoutingStatus) {
                        elRoutingStatus.innerText = partnerDripActive 
                            ? 'Status: Primary cap of ' + pLimit + ' reached. Drip routing signups to Secondary Link (' + currentSecondaryCode + ').'
                            : 'Status: Routing new signups to Primary Link (' + pCode + ').';
                    }

                    const elSecondaryCount = document.getElementById('partner-cfg-secondary-count-display');
                    if (elSecondaryCount) {
                        elSecondaryCount.innerText = 'Secondary Link Enrolled: ' + sCount + ' Partners';
                    }

                    // Update all dynamic partner links across the DOM
                    document.querySelectorAll('a[data-partner-link="true"]').forEach(a => {
                        a.href = currentPartnerLink;
                    });
                    document.querySelectorAll('[data-partner-code="true"]').forEach(el => {
                        el.innerText = currentPartnerCode;
                    });
                }
            } catch(e) {}
        }"""

if old_sync in content:
    content = content.replace(old_sync, new_sync)
else:
    print("Warning: old_sync not matched directly")

# 5. Update savePartnerConfigUI
old_save = """        async function savePartnerConfigUI() {
            const inpCode = document.getElementById('partner-cfg-code');
            const inpLink = document.getElementById('partner-cfg-link');
            const code = inpCode ? inpCode.value.trim() : '';
            const link = inpLink ? inpLink.value.trim() : '';

            if (!code || !link) {
                alert("Please provide both a valid partner referral code and full registration URL.");
                return;
            }

            try {
                const res = await fetch('/api/partner/config', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        referral_code: code,
                        referral_link: link
                    })
                });
                const data = await res.json();
                if (data.success) {
                    currentPartnerCode = data.config.referral_code;
                    currentPartnerLink = data.config.referral_link;

                    const jmRegCode = document.getElementById('jm-input-reg-code');
                    if (jmRegCode) jmRegCode.value = currentPartnerCode;
                    const promoInp = document.getElementById('partner-link-input');
                    if (promoInp) promoInp.value = currentPartnerLink;

                    // Update DOM links immediately
                    document.querySelectorAll('a[data-partner-link="true"]').forEach(a => {
                        a.href = currentPartnerLink;
                    });
                    document.querySelectorAll('[data-partner-code="true"]').forEach(el => {
                        el.innerText = currentPartnerCode;
                    });

                    const toast = document.getElementById('partner-cfg-toast');
                    if (toast) {
                        toast.style.display = 'block';
                        setTimeout(() => { toast.style.display = 'none'; }, 3500);
                    }
                    loadAdminPortalUsers();
                } else {
                    alert(data.message || 'Failed to update partner configuration.');
                }
            } catch(e) {
                alert('Save error: ' + e.message);
            }
        }"""

new_save = """        async function savePartnerConfigUI() {
            const pCode = document.getElementById('partner-cfg-primary-code') ? document.getElementById('partner-cfg-primary-code').value.trim() : 'tohstb0d83';
            const pLink = document.getElementById('partner-cfg-primary-link') ? document.getElementById('partner-cfg-primary-link').value.trim() : 'https://one.justmarkets.link/a/tohstb0d83';
            const pLimit = document.getElementById('partner-cfg-primary-limit') ? Number(document.getElementById('partner-cfg-primary-limit').value.trim()) : 10;
            const sCode = document.getElementById('partner-cfg-secondary-code') ? document.getElementById('partner-cfg-secondary-code').value.trim() : 'p4cui0wkfz';
            const sLink = document.getElementById('partner-cfg-secondary-link') ? document.getElementById('partner-cfg-secondary-link').value.trim() : 'https://one.justmarkets.link/a/p4cui0wkfz';

            try {
                const res = await fetch('/api/partner/config', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        primary_code: pCode,
                        primary_link: pLink,
                        primary_limit: pLimit,
                        secondary_code: sCode,
                        secondary_link: sLink
                    })
                });
                const data = await res.json();
                if (data.success) {
                    await syncPartnerConfigGlobally();
                    const toast = document.getElementById('partner-cfg-toast');
                    if (toast) {
                        toast.style.display = 'block';
                        setTimeout(() => { toast.style.display = 'none'; }, 3500);
                    }
                    loadAdminPortalUsers();
                } else {
                    alert(data.message || 'Failed to update partner configuration.');
                }
            } catch(e) {
                alert('Save error: ' + e.message);
            }
        }"""

if old_save in content:
    content = content.replace(old_save, new_save)
else:
    print("Warning: old_save not matched directly")

# 6. Update isUserAuthenticatedAndVerified and login response
content = content.replace(
    "const activePartner = (currentPartnerCode || 'p4cui0wkfz').trim().toLowerCase();\n            return isV && (refCode === activePartner || refCode === 'p4cui0wkfz');",
    "const validCodes = ['tohstb0d83', 'p4cui0wkfz', (currentPartnerCode || '').trim().toLowerCase(), (currentSecondaryCode || '').trim().toLowerCase()];\n            return isV && validCodes.includes(refCode);"
)

content = content.replace(
    "if (isV && (refCode === activePartner || refCode === 'p4cui0wkfz')) {",
    "const validCodes = ['tohstb0d83', 'p4cui0wkfz', (currentPartnerCode || '').trim().toLowerCase(), (currentSecondaryCode || '').trim().toLowerCase()];\n                    if (isV && validCodes.includes(refCode)) {"
)

# 7. Update copyPartnerConfigLink to copy active link
content = content.replace(
    "const link = inp ? inp.value : currentPartnerLink;",
    "const link = currentPartnerLink || 'https://one.justmarkets.link/a/tohstb0d83';"
)

with open('dashboard/static/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("dashboard/static/index.html updated successfully.")
