#!/usr/bin/env python3
"""
Fase 1 (Director) del Video Editor MVP: transcribe la narración, arma el
EDL borrador (plan.json) aplicando fases NEAPS/AIDA + estándares de
reference/viral_video_standards.md, y escribe plan.md para presentar en
el chat. No ensambla nada — eso es process_video.py (Fase 2).

Uso: plan_video.py <narration_path> <project_name> [--brief TEXT]
     [--footage FASE=RUTA ...] [--whisper-model MODEL] [--lang LANG]
     [--output-dir DIR]

Fases válidas para --footage: hook, problema, autoridad, solucion,
prueba_social, cierre.
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402
import edl  # noqa: E402


def parse_args(argv):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("narration_path", help="Ruta al audio de la narración ya grabada.")
    parser.add_argument("project_name", help="Nombre del proyecto (carpeta bajo output/).")
    parser.add_argument("--brief", default="", help="Brief corto describiendo el video.")
    parser.add_argument("--footage", action="append", default=[], metavar="FASE=RUTA",
                         help="Footage propio para una fase (repetible), ej. hook=/ruta/clip.mp4")
    parser.add_argument("--whisper-model", default="base")
    parser.add_argument("--lang", default="es")
    parser.add_argument("--output-dir", default=None)
    return parser.parse_args(argv)


def _build_footage_map(footage_args):
    footage_map = {}
    for entry in footage_args:
        if "=" not in entry:
            print(f"ERROR: --footage debe ser FASE=RUTA, recibí '{entry}'.", file=sys.stderr)
            sys.exit(1)
        phase, path = entry.split("=", 1)
        if phase not in edl.PHASE_ORDER:
            print(f"ERROR: fase '{phase}' inválida. Válidas: {', '.join(edl.PHASE_ORDER)}.", file=sys.stderr)
            sys.exit(1)
        if not os.path.isfile(path):
            print(f"ERROR: no existe el archivo de footage '{path}' (fase '{phase}').", file=sys.stderr)
            sys.exit(1)
        duration_s = analyze.probe_metadata(path)["duration_s"]
        footage_map[phase] = {"path": path, "duration_s": duration_s}
    return footage_map


def main():
    args = parse_args(sys.argv[1:])

    if not os.path.isfile(args.narration_path):
        print(f"ERROR: no existe el archivo de narración '{args.narration_path}'.", file=sys.stderr)
        sys.exit(1)

    output_dir = args.output_dir or os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "output", args.project_name
    )
    os.makedirs(output_dir, exist_ok=True)

    footage_map = _build_footage_map(args.footage)

    print("[1/3] metadata de la narración (ffprobe)...")
    narration_meta = analyze.probe_metadata(args.narration_path)
    duration_s = narration_meta["duration_s"]
    print(f"  ok  duración {duration_s:.2f}s")

    print(f"[2/3] transcripción (whisper, modelo={args.whisper_model}, idioma={args.lang})...")
    captions_srt_path = analyze.run_whisper(args.narration_path, output_dir, args.whisper_model, args.lang)
    transcript_segments = edl.parse_srt_segments(captions_srt_path)
    print(f"  ok  {len(transcript_segments)} segmentos -> captions.srt")

    print("[3/3] construyendo EDL borrador...")
    edl_dict = edl.build_edl(
        args.project_name, args.brief, args.narration_path, captions_srt_path,
        transcript_segments, duration_s, footage_map,
    )
    plan_json_path = os.path.join(output_dir, "plan.json")
    plan_md_path = os.path.join(output_dir, "plan.md")
    with open(plan_json_path, "w", encoding="utf-8") as f:
        json.dump(edl_dict, f, indent=2, ensure_ascii=False)
    with open(plan_md_path, "w", encoding="utf-8") as f:
        f.write(edl.render_plan_markdown(edl_dict))

    unresolved = sum(1 for s in edl_dict["shots"] if s["source_type"] == "broll_needed")
    print(f"  ok  {len(edl_dict['shots'])} planos, {unresolved} huecos de B-roll -> plan.json, plan.md")
    print()
    print(f"Plan escrito en: {plan_json_path}")
    print("Siguiente paso: revisar plan.md en el chat y escribir approved_plan.json con las decisiones.")


if __name__ == "__main__":
    main()
