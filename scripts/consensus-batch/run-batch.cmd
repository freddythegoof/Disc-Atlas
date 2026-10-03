@echo off
setlocal
set LOG=C:\Users\user\disc-atlas\scripts\consensus-batch\run.log
echo %date% %time% - batch start>> "%LOG%"
cd /d C:\Users\user\disc-atlas-twin2
git merge main >> "%LOG%" 2>&1
powershell -NoProfile -Command "$p = Get-Content 'C:\Users\user\disc-atlas\scripts\consensus-batch\batch-prompt.md' -Raw -Encoding utf8; & 'C:\Users\user\AppData\Roaming\npm\claude.cmd' -p $p --model sonnet --allowedTools 'Read,Write,Edit,Bash,WebFetch,WebSearch'" >> "%LOG%" 2>&1
echo %date% %time% - batch done>> "%LOG%"
