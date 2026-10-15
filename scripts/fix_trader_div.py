with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = """            <!-- ============================================================== -->
            <!-- VIEW 3: PARTNER ONBOARDING -->
            <!-- ============================================================== -->
            </div>
            </div>
            
            <!-- ============================================================== -->
            <!-- AI TRADING STRATEGIES VIEW (CORE USP) -->"""

replacement = """            <!-- ============================================================== -->
            <!-- VIEW 3: PARTNER ONBOARDING -->
            <!-- ============================================================== -->
            </div>
            
            <!-- ============================================================== -->
            <!-- AI TRADING STRATEGIES VIEW (CORE USP) -->"""

assert target in text, "Target not found in index.html"
new_text = text.replace(target, replacement, 1)

with open('dashboard/static/index.html', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Removed extra </div> successfully.")
