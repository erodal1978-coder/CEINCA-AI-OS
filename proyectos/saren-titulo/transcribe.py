import glob
import json
import os
import whisper

model = whisper.load_model('base')

clips = [
    '/home/eduardo/CEINCA-AI-OS/proyectos/saren-titulo/flow-clips/flow_e1_hook.mp4',
    '/home/eduardo/CEINCA-AI-OS/proyectos/saren-titulo/flow-clips/flow_e2_portal.mp4',
    '/home/eduardo/CEINCA-AI-OS/proyectos/saren-titulo/flow-clips/flow_e3_datos.mp4',
    '/home/eduardo/CEINCA-AI-OS/proyectos/saren-titulo/flow-clips/flow_e4_pub.mp4',
    '/home/eduardo/CEINCA-AI-OS/proyectos/saren-titulo/flow-clips/flow_e5_cta.mp4',
]

results = {}
for i, path in enumerate(clips, 1):
    print(f"Transcribing scene {i}: {os.path.basename(path)}...")
    res = model.transcribe(path, language='es', word_timestamps=True)
    results[f"escena_{i}"] = {
        "text": res["text"],
        "segments": res["segments"]
    }
    print(f"E{i} text: {res['text'].strip()}")

out_file = '/tmp/transcripcion_saren.json'
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Saved transcription to {out_file}")
