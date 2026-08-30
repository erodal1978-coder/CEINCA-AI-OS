#!/bin/bash
# Placa final del vídeo de habitaciones — fondo de la piscina desenfocado
set -e
S=/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad
SRC=/root/.claude/uploads/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11
FA=$S/fonts/Anton.ttf
FB=$S/fonts/ArchivoBlack.ttf

ffmpeg -y -v error -loop 1 -framerate 30 -t 3.4 \
  -i "$SRC/aad92147-679444.jpg" -filter_complex "
[0:v]crop=720:1280:30:0,scale=1620:2880:flags=lanczos,fps=30,
zoompan=z='1.12-0.05*on/102':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30,
eq=contrast=1.06:saturation=1.20:brightness=-0.16,
colorbalance=rs=0.02:bh=0.03,
gblur=sigma=18,
vignette=PI/3.4,
noise=alls=4:allf=t+u,

drawtext=fontfile='$FB':text='YA DISPONIBLE':fontcolor=0x00E5FF:fontsize=42:x=(w-tw)/2:y=600:alpha='min(1\,t/0.3)',

drawtext=fontfile='$FA':text='CASA':fontcolor=white:fontsize=205:x=(w-tw)/2:y='690-40*(1-min(1\,t/0.35))':alpha='min(1\,t/0.35)':borderw=8:bordercolor=black@0.7,
drawtext=fontfile='$FA':text='& CAMPO':fontcolor=white:fontsize=205:x=(w-tw)/2:y='880-40*(1-min(1\,max(0\,t-0.12)/0.35))':alpha='min(1\,max(0\,t-0.12)/0.35)':borderw=8:bordercolor=black@0.7,

drawbox=x=390:y=1130:w=300:h=5:color=0xFF2D95@0.95:t=fill:enable='gt(t\,0.5)',

drawtext=fontfile='$FB':text='HOSPEDAJE · CABAÑAS · DESCANSO':fontcolor=white:fontsize=31:x=(w-tw)/2:y=1195:alpha='min(1\,max(0\,t-0.6)/0.4)',
drawtext=fontfile='$FB':text='EL JOBAL · A 15 MIN DE LA REDOMA · BARINAS':fontcolor=0xC6FF00:fontsize=29:x=(w-tw)/2:y=1258:alpha='min(1\,max(0\,t-0.7)/0.4)',

drawtext=fontfile='$FB':text='COMENTA\: HOSPEDAJE':fontcolor=black:fontsize=54:x=(w-tw)/2:y=1430:box=1:boxcolor=0xC6FF00@0.96:boxborderw=30:alpha='min(1\,max(0\,t-0.9)/0.4)',
drawtext=fontfile='$FB':text='@casacampobarinas1':fontcolor=white:fontsize=40:x=(w-tw)/2:y=1560:alpha='min(1\,max(0\,t-1.1)/0.4)',
drawtext=fontfile='$FB':text='0424-5541927':fontcolor=0x00E5FF:fontsize=36:x=(w-tw)/2:y=1623:alpha='min(1\,max(0\,t-1.25)/0.4)',

format=yuv420p" \
 -frames:v 102 -an -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
 "$S/seg2/99_endcard.mp4"

echo "placa final lista"
ffprobe -v error -show_entries stream=width,height,nb_frames -of csv=p=0 "$S/seg2/99_endcard.mp4"
