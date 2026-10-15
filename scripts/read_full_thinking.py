import json

with open(r'C:\Users\ADMIN\.gemini\antigravity\brain\5292252d-a1af-4b4c-b266-b864c0bf8184\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        idx = data.get('step_index')
        if idx in [2945, 2952]:
            print(f"=== FULL THINKING STEP {idx} ===")
            print(data.get('thinking'))
