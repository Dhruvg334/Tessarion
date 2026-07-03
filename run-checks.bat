@echo off
call npm run lint
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
call npm run typecheck
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
call npm run test:run
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
call npm run eval:rag
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
call npm run eval:concepts
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
call npm run eval:teachback
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
call npm run build
