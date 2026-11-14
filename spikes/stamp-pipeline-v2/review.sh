#!/bin/sh
# Regenerates the close-up sheets and overlays the write-up reads (work/stamp-pipeline-v2/sheets, ignored).
cd "$(dirname "$0")"
Z=../../work/stamp-pipeline-v2/sheets R=../../work/stamp-pipeline-v2/runs
node zoom.mjs berg-original 0.40,0.69,0.58,0.74 $Z/berg-original-small.png "production, WebKit input=prodcap-alpha.raw.gz" "production, Node crop=prod-alpha.raw.gz" "v2, 3778 native=v2-alpha2048.raw.gz"
node zoom.mjs berg-stored 0.40,0.69,0.58,0.74 $Z/berg-stored-small.png "production=prod-alpha.raw.gz" "v2, 1024 stored=v2-alpha2048.raw.gz"
node zoom.mjs proxy 0.36,0.375,0.64,0.455 $Z/proxy-small.png "production=prod-alpha.raw.gz" "v2=v2-alpha2048.raw.gz"
node zoom.mjs proxy 0.38,0.65,0.62,0.85 $Z/proxy-bottom.png "production=prod-alpha.raw.gz" "v2=v2-alpha2048.raw.gz"
node zoom.mjs wraith 0.30,0.33,0.70,0.56 $Z/wraith-ghost.png "production=prod-alpha.raw.gz" "v2=v2-alpha2048.raw.gz"
node zoom.mjs destroyer 0.48,0.25,0.72,0.42 $Z/destroyer-top.png "production=prod-alpha.raw.gz" "v2=v2-alpha2048.raw.gz"
node zoom.mjs destroyer 0.42,0.58,0.72,0.78 $Z/destroyer-bottom.png "production=prod-alpha.raw.gz" "v2=v2-alpha2048.raw.gz"
node zoom.mjs dd3 0.62,0.30,0.92,0.62 $Z/dd3-right.png "production design=prod-design.raw.gz" "v2=v2-alpha2048.raw.gz"
for d in berg-original berg-stored proxy wraith raptor dd3 destroyer; do node view.mjs $R/$d/v2-alpha2048.raw.gz $R/$d/prod-design.raw.gz $R/$d/ov.png 2048 640; done
node view.mjs $R/berg-original/v2-alpha2048.raw.gz $R/berg-original/prodcap-alpha.raw.gz $R/berg-original/ov-cap.png 2048 640
