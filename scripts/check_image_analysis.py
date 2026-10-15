import json

with open(r'C:\Users\ADMIN\.gemini\antigravity\brain\5292252d-a1af-4b4c-b266-b864c0bf8184\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        idx = data.get('step_index')
        if idx in [2944, 2945, 2946, 2951, 2952, 2954]:
            print(f"=== STEP {idx} ===")
            if data.get('thinking'):
                print("Thinking snippet:", data.get('thinking')[:400])
            if data.get('content'):
                print("Content snippet:", str(data.get('content'))[:400])
