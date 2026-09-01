#!/usr/bin/env python3
"""
Fase 2 (Workers -> Ensamblador -> QC) del Video Editor MVP: resuelve cada
plano 'agent_searches' con broll.py, valida los 'user_provides', ensambla
el video final con ffmpeg (assemble.py) y corre QC automático (qc.py).

Uso: process_video.py <approved_plan_path>

approved_plan.json debe traer, además del esquema de plan.json:
  - "source_decision" resuelto ("user_provides"|"agent_searches") en cada
    plano con source_type == "broll_needed" (y "source_path" ya apuntando
    al archivo si es "user_provides").
  - "music_path": ruta al archivo de música, o null si se resuelve después.

Requiere PEXELS_API_KEY y PIXABAY_API_KEY en el entorno (cargadas desde
media-mvp/.env) si hay algún plano "agent_searches".
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402
import assemble  # noqa: E402
import broll  # noqa: E402
import qc  # noqa: E402


def _load_env_file(env_path):
    """Carga media-mvp/.env sin dependencias externas (no hay python-dotenv
    en el stack) -- mismo formato simple KEY=VALUE por línea."""
    if not os.path.isfile(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def _resolve_shots(shots, output_dir):
    pexels_key = os.environ.get("PEXELS_API_KEY")
    pixabay_key = os.environ.get("PIXABAY_API_KEY")

    for shot in shots:
        if shot["source_type"] == "footage_provided":
            if not os.path.isfile(shot["source_path"]):
                print(f"ERROR: footage propio '{shot['source_path']}' del plano {shot['id']} ya no existe.",
                      file=sys.stderr)
                sys.exit(1)
            continue

        if shot["source_decision"] == "user_provides":
            if not shot.get("source_path") or not os.path.isfile(shot["source_path"]):
                print(f"ERROR: plano {shot['id']} marcado 'user_provides' pero source_path no existe.",
                      file=sys.stderr)
                sys.exit(1)
            actual_duration = analyze.probe_metadata(shot["source_path"])["duration_s"]
            if actual_duration < shot["duration_s"]:
                print(f"  ⚠️  plano {shot['id']}: el asset subido dura {actual_duration:.1f}s, "
                      f"se necesitaban {shot['duration_s']:.1f}s -- se recorta lo disponible.")
            continue

        if shot["source_decision"] == "agent_searches":
            print(f"  buscando B-roll para plano {shot['id']} ('{shot['broll_keyword']}')...")
            broll.resolve_broll_worker(shot, pexels_key, pixabay_key, output_dir)
            if shot["source_path"] is None:
                print(f"  ⚠️  plano {shot['id']}: sin resultado válido en Pexels/Pixabay -> unresolved")
            continue

        print(f"ERROR: plano {shot['id']} no tiene source_decision resuelto "
              f"('user_provides'/'agent_searches'). Revisa approved_plan.json.", file=sys.stderr)
        sys.exit(1)


def _assemble_final(edl_dict, output_dir):
    shots = edl_dict["shots"]
    shots_dir = os.path.join(output_dir, "shots")
    os.makedirs(shots_dir, exist_ok=True)

    shot_clip_paths = []
    for shot in shots:
        dest = os.path.join(shots_dir, f"shot{shot['id']}.mp4")
        cmd = assemble.build_trim_command(shot["source_path"], shot["source_offset_s"], shot["duration_s"], dest)
        assemble.run_ffmpeg(cmd, f"recorte plano {shot['id']}")
        shot_clip_paths.append(dest)

    concat_list_path = os.path.join(output_dir, "concat_list.txt")
    concat_path = os.path.join(output_dir, "_concat.mp4")
    assemble.run_ffmpeg(
        assemble.build_concat_command(shot_clip_paths, concat_list_path, concat_path), "concatenación"
    )

    subtitled_path = os.path.join(output_dir, "_subtitled.mp4")
    if os.path.getsize(edl_dict["captions_srt_path"]) > 0:
        assemble.run_ffmpeg(
            assemble.build_subtitle_command(concat_path, edl_dict["captions_srt_path"], subtitled_path),
            "quemado de subtítulos"
        )
    else:
        assemble.run_ffmpeg(
            ["ffmpeg", "-y", "-i", concat_path, "-c", "copy", subtitled_path],
            "quemado de subtítulos (saltado, SRT vacío)"
        )

    plates_cmd = assemble.build_text_plates_command(subtitled_path, shots, os.path.join(output_dir, "_plated.mp4"))
    if plates_cmd is None:
        plated_path = subtitled_path
    else:
        plated_path = os.path.join(output_dir, "_plated.mp4")
        assemble.run_ffmpeg(plates_cmd, "placas de texto")

    final_path = os.path.join(output_dir, "final.mp4")
    if edl_dict.get("music_path"):
        assemble.run_ffmpeg(
            assemble.build_audio_mix_command(plated_path, edl_dict["narration_path"], edl_dict["music_path"], final_path),
            "mezcla de audio con música",
        )
    else:
        print("  ⚠️  sin música confirmada (music_path es null) -- entregando con solo narración.")
        assemble.run_ffmpeg(
            assemble.build_narration_only_command(plated_path, edl_dict["narration_path"], final_path),
            "mezcla de audio (solo narración)",
        )

    return final_path


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    approved_plan_path = sys.argv[1]
    if not os.path.isfile(approved_plan_path):
        print(f"ERROR: no existe '{approved_plan_path}'.", file=sys.stderr)
        sys.exit(1)

    _load_env_file(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

    with open(approved_plan_path, encoding="utf-8") as f:
        edl_dict = json.load(f)

    output_dir = os.path.dirname(os.path.abspath(approved_plan_path))

    print("[1/3] resolviendo planos (Workers)...")
    _resolve_shots(edl_dict["shots"], output_dir)

    unresolved = [s["id"] for s in edl_dict["shots"] if s["source_path"] is None]
    if unresolved:
        print(f"ERROR: {len(unresolved)} plano(s) sin resolver: {unresolved}.", file=sys.stderr)
        print("Sube el asset que falta o cambia la decisión en approved_plan.json y vuelve a correr.",
              file=sys.stderr)
        sys.exit(1)

    resolved_plan_path = os.path.join(output_dir, "resolved_plan.json")
    with open(resolved_plan_path, "w", encoding="utf-8") as f:
        json.dump(edl_dict, f, indent=2, ensure_ascii=False)
    print(f"  ok  todos los planos resueltos -> {resolved_plan_path}")

    print("[2/3] ensamblando video final (ffmpeg)...")
    final_path = _assemble_final(edl_dict, output_dir)
    print(f"  ok  {final_path}")

    print("[3/3] QC automático...")
    report = qc.run_qc(final_path, edl_dict["captions_srt_path"], edl_dict["duration_s"])
    print(qc.format_qc_report(report))

    print()
    print(f"Entregado: {final_path}")


if __name__ == "__main__":
    main()
