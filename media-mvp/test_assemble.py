#!/usr/bin/env python3
"""
Tests para media-mvp/assemble.py. Sin pytest, sin invocar ffmpeg real —
solo se valida la forma de los comandos construidos (listas de argv).

Uso: python3 media-mvp/test_assemble.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import assemble  # noqa: E402


def test_build_trim_command_includes_offset_and_duration():
    cmd = assemble.build_trim_command("/src/clip.mp4", 2.5, 3.0, "/out/shot1.mp4")
    assert cmd[0] == "ffmpeg"
    assert "-ss" in cmd and cmd[cmd.index("-ss") + 1] == "2.5"
    assert "-t" in cmd and cmd[cmd.index("-t") + 1] == "3.0"
    assert cmd[-1] == "/out/shot1.mp4"
    assert "-an" in cmd, "los planos individuales no deben traer audio propio"


def test_build_concat_command_writes_list_file(tmp_path=None):
    import tempfile
    d = tempfile.mkdtemp(prefix="media_mvp_assemble_test_")
    try:
        list_path = os.path.join(d, "concat.txt")
        cmd = assemble.build_concat_command(["/out/shot1.mp4", "/out/shot2.mp4"], list_path, "/out/concat.mp4")
        assert os.path.isfile(list_path)
        content = open(list_path).read()
        assert "/out/shot1.mp4" in content
        assert "/out/shot2.mp4" in content
        assert cmd[-1] == "/out/concat.mp4"
        assert "-f" in cmd and cmd[cmd.index("-f") + 1] == "concat"
    finally:
        import shutil
        shutil.rmtree(d)


def test_build_subtitle_command_references_srt_path():
    cmd = assemble.build_subtitle_command("/out/concat.mp4", "/out/captions.srt", "/out/subtitled.mp4")
    vf = cmd[cmd.index("-vf") + 1]
    assert "/out/captions.srt" in vf
    assert "subtitles=" in vf


def test_build_text_plates_command_none_when_no_hook_or_cierre_text():
    shots = [{"phase": "solucion", "subtitle_text": "algo", "start_s": 0, "end_s": 3}]
    cmd = assemble.build_text_plates_command("/out/x.mp4", shots, "/out/y.mp4")
    assert cmd is None


def test_build_text_plates_command_builds_drawtext_for_hook():
    shots = [{"phase": "hook", "subtitle_text": "ya puedes apostillar", "start_s": 0.0, "end_s": 4.0}]
    cmd = assemble.build_text_plates_command("/out/x.mp4", shots, "/out/y.mp4")
    assert cmd is not None
    vf = cmd[cmd.index("-vf") + 1]
    assert "drawtext" in vf
    assert "YA PUEDES APOSTILLAR" in vf
    assert "between(t,0.0,4.0)" in vf


def test_build_audio_mix_command_maps_video_and_mixed_audio():
    cmd = assemble.build_audio_mix_command("/out/video.mp4", "/in/narr.wav", "/in/music.mp3", "/out/final.mp4")
    assert "-map" in cmd
    assert "2:v" in cmd
    assert "[aout]" in cmd
    assert cmd[-1] == "/out/final.mp4"


def test_build_narration_only_command_maps_video_and_narration():
    cmd = assemble.build_narration_only_command("/out/video.mp4", "/in/narr.wav", "/out/final.mp4")
    assert "0:v" in cmd
    assert "1:a" in cmd
    assert cmd[-1] == "/out/final.mp4"


TESTS = [
    test_build_trim_command_includes_offset_and_duration,
    test_build_concat_command_writes_list_file,
    test_build_subtitle_command_references_srt_path,
    test_build_text_plates_command_none_when_no_hook_or_cierre_text,
    test_build_text_plates_command_builds_drawtext_for_hook,
    test_build_audio_mix_command_maps_video_and_mixed_audio,
    test_build_narration_only_command_maps_video_and_narration,
]


def main():
    failures = []
    for test in TESTS:
        name = test.__name__
        try:
            test()
            print(f"PASS  {name}")
        except AssertionError as e:
            print(f"FAIL  {name}: {e}")
            failures.append(name)
        except Exception as e:
            print(f"ERROR {name}: {type(e).__name__}: {e}")
            failures.append(name)
    print()
    if failures:
        print(f"{len(failures)}/{len(TESTS)} tests fallaron: {', '.join(failures)}")
        sys.exit(1)
    print(f"{len(TESTS)}/{len(TESTS)} tests OK")


if __name__ == "__main__":
    main()
