@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem 设置控制台为 UTF-8，避免中文乱码
chcp 65001 >nul

echo === 项目一次性安装与设置 ===

rem --- 路径检查 ---
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
if not exist "%BACKEND%\package.json" (
  echo [错误] 未找到后端 package.json
  exit /b 1
)
if not exist "%ROOT%\package.json" (
  echo [错误] 未找到前端 package.json
  exit /b 1
)

rem --- 安装前端依赖 ---
echo [1/3] 正在安装前端依赖...
pushd "%ROOT%"
call npm install --no-fund --no-audit
popd

rem --- 安装后端依赖 ---
echo [2/3] 正在安装后端依赖...
pushd "%BACKEND%"
call npm install --no-fund --no-audit
popd

rem --- 写入数据库配置并创建数据库 ---
echo [3/3] 正在创建数据库 'research_db'（如果不存在）...
> "%BACKEND%\.env" (
  echo DB_DIALECT=mysql
  echo DB_HOST=localhost
  echo DB_PORT=3306
  echo DB_NAME=research_db
  echo DB_USER=root
  echo DB_PASS=@LYMoa4pta8w
  echo DB_LOGGING=true
)
pushd "%BACKEND%"
call npm run db:create
popd

echo.
echo.
echo [完成] 项目设置完毕。
echo 你现在可以使用 start-project.ps1 或 start-backend-*.bat 来启动服务。

pause

