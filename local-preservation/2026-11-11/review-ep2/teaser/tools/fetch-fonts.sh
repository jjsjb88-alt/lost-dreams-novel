#!/bin/sh
# Noto Sans KR (Bold/Medium), Noto Serif KR (Light/Regular) — SIL OFL. 렌더 전에 한 번 실행한다.
set -e
D="$(dirname "$0")/../fonts"; mkdir -p "$D"
curl -sSL -o "$D/f1.ttf" https://fonts.gstatic.com/s/notosanskr/v40/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf
curl -sSL -o "$D/f2.ttf" https://fonts.gstatic.com/s/notosanskr/v40/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzztgyeLQ.ttf
curl -sSL -o "$D/f3.ttf" https://fonts.gstatic.com/s/notoserifkr/v32/3JnoSDn90Gmq2mr3blnHaTZXbOtLJDvui3JOnci4eM52.ttf
curl -sSL -o "$D/f4.ttf" https://fonts.gstatic.com/s/notoserifkr/v32/3JnoSDn90Gmq2mr3blnHaTZXbOtLJDvui3JOncjmeM52.ttf
