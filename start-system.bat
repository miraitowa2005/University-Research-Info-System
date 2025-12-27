@echo off
chcp 65001 >nul

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"

echo =======================================================
echo      高校科研管理系统 - 启动脚本
echo =======================================================
echo.

set "NONINTERACTIVE=0"
set "INIT_DB=n"
set "BACKEND_PORT="
set "FRONTEND_PORT="
set "OPEN_BROWSER=y"

:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="--noninteractive" set "NONINTERACTIVE=1"
if /I "%~1"=="--noinit" set "INIT_DB=n"
if /I "%~1"=="--init" set "INIT_DB=y"
if /I "%~1"=="--backend-port" (
  set "BACKEND_PORT=%~2"
  shift
)
if /I "%~1"=="--frontend-port" (
  set "FRONTEND_PORT=%~2"
  shift
)
if /I "%~1"=="--no-browser" set "OPEN_BROWSER=n"
shift
goto parse_args
:args_done

:: 检查 Python 和 pip 是否安装
echo [1/6] 检查 Python 和 pip 版本...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python
    pause
    exit /b 1
)

where pip >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 pip，请先安装 Python 和 pip
    pause
    exit /b 1
)

python --version
echo pip版本: 
pip --version
echo.

:: 检查 Node.js 和 npm 是否安装
echo [2/6] 检查 Node.js 和 npm 版本...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 npm，请先安装 Node.js 和 npm
    pause
    exit /b 1
)

node --version
echo npm版本: 
for /f "tokens=*" %%i in ('npm --version 2^>nul') do echo %%i
if errorlevel 1 (
    echo [错误] 获取npm版本失败，请检查npm安装
    pause
    exit /b 1
)
echo.

:: 安装 Python 后端依赖
echo [3/6] 安装 Python 后端依赖...
pushd "%BACKEND%"

:: 检查并安装缺少的Python依赖
    echo   [信息] 正在检查并安装缺少的Python依赖...
    call pip install -r requirements.txt --no-cache-dir --timeout 120 -i https://pypi.tuna.tsinghua.edu.cn/simple/ --upgrade-strategy only-if-needed
if %errorlevel% equ 0 (
    echo   [成功] 后端依赖安装完成（使用清华镜像源）
    popd
echo.
goto install_frontend
)

:: 如果仍然失败，提示用户手动安装
echo   [错误] 依赖安装失败，请检查网络连接或手动安装依赖
set /p "user_choice=是否继续启动服务？(y/n): "
if /i "%user_choice%" neq "y" (
    echo   [信息] 取消启动服务
    popd
    pause
    exit /b 1
)
echo   [信息] 继续启动服务
popd
echo.
:install_frontend

:: 安装前端依赖
echo [4/6] 检查并安装前端依赖...
echo   [信息] 正在检查并安装缺少的前端依赖...
pushd "%ROOT%"
call npm install --no-fund --no-audit
if %errorlevel% neq 0 (
    echo [错误] 前端依赖安装失败
    popd
    pause
    exit /b 1
)
popd
echo   [信息] 前端依赖检查/安装完成
echo.

if "%BACKEND_PORT%"=="" set "BACKEND_PORT=5003"
:check_port
netstat -ano | findstr ":%BACKEND_PORT%" >nul 2>&1
if %errorlevel% equ 0 (
    set /a BACKEND_PORT+=1
    goto check_port
)
echo [5/6] 后端将使用端口: %BACKEND_PORT%
echo.

echo [6/6] 数据库初始化和服务启动...
echo.
if /i "%INIT_DB%"=="y" (
    echo 正在初始化数据库...
    pushd "%BACKEND%"
    python init_db.py
    if %errorlevel% neq 0 (
        echo 数据库初始化失败！
        popd
        pause
        exit /b 1
    )
    popd
    echo 数据库初始化完成！
    echo.
)

:: 启动服务
echo 启动后端和前端服务...
echo.

:: 启动后端服务
echo 启动后端服务...
cd /d "%BACKEND%"
start "Backend Server" cmd.exe /k "uvicorn app.main:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"

:: 等待后端服务启动
ping 127.0.0.1 -n 3 >nul

:: 启动前端服务
echo 启动前端服务...
set "FRONTEND_API_URL=http://127.0.0.1:%BACKEND_PORT%/api/v1"
if "%FRONTEND_PORT%"=="" set "FRONTEND_PORT=3001"
cd /d "%ROOT%"
start "Frontend Server" cmd.exe /k "set VITE_API_BASE=%FRONTEND_API_URL% && npm run dev -- --port %FRONTEND_PORT%"

echo.
echo =======================================================
echo [成功] 服务启动完成！
echo =======================================================
echo 后端服务地址: http://127.0.0.1:%BACKEND_PORT%
echo 前端服务地址: http://localhost:%FRONTEND_PORT%
echo.
echo 请在浏览器中访问 http://localhost:%FRONTEND_PORT% 来使用系统
echo =======================================================
echo.

if /I "%OPEN_BROWSER%"=="y" start http://localhost:%FRONTEND_PORT%
