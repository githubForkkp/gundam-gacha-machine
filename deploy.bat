@echo off
echo ========================================
echo 高达扭蛋机 - 部署准备脚本
echo ========================================
echo.

echo 正在检查项目文件...
if not exist "index.html" (
    echo 错误: 找不到 index.html 文件
    pause
    exit /b 1
)

if not exist "main.js" (
    echo 错误: 找不到 main.js 文件
    pause
    exit /b 1
)

if not exist "style.css" (
    echo 错误: 找不到 style.css 文件
    pause
    exit /b 1
)

echo ✓ 核心文件检查完成
echo.

echo 正在创建部署包...
if exist "deploy.zip" del "deploy.zip"

echo 添加文件到部署包...
powershell -command "Compress-Archive -Path 'index.html', 'main.js', 'style.css', 'gacha_data.js', 'README.md', 'package.json', 'vercel.json', 'DEPLOYMENT.md' -DestinationPath 'deploy.zip' -Force"

if exist "deploy.zip" (
    echo ✓ 部署包创建成功: deploy.zip
    echo.
    echo 下一步操作:
    echo 1. 访问 https://claw.cloud
    echo 2. 登录您的账户
    echo 3. 创建新项目
    echo 4. 选择"上传文件"
    echo 5. 上传 deploy.zip 文件
    echo 6. 等待部署完成
    echo.
) else (
    echo ✗ 部署包创建失败
    pause
    exit /b 1
)

echo 按任意键打开 Claw.cloud...
pause
start https://claw.cloud 