import os
import shutil
import subprocess
import time

# 读取 hook.js 和 init.js 的内容
with open("win/hook.js", "r", encoding="utf-8") as f:
    hook_content = f.read()
with open("win/init.js", "r", encoding="utf-8") as f:
    init_content = f.read()
# 拼接内容
xmind_content = hook_content + init_content
# 将拼接后的内容保存为 xmind.js
with open("win/xmind.js", "w", encoding="utf-8") as f:
    f.write(xmind_content)
# 执行 javascript-obfuscator
os.system("javascript-obfuscator win/xmind.js --config ob.json -o win/xmind.b.js")
# 读取 js-yaml.min.js 的内容
with open("js-yaml.min.js", "r", encoding="utf-8") as f:
    yaml_content = f.read()
# 读取 xmind.b.js 的内容
with open("win/xmind.b.js", "r", encoding="utf-8") as f:
    xmind_b_content = f.read()
# 在 xmind.b.js 文件前面插入 js-yaml.min.js 的内容
new_content = yaml_content + xmind_b_content
# 将新内容保存到 xmind.b.js 文件中
with open("win/asset/xmind.b.js", "w", encoding="utf-8") as f:
    f.write(new_content)
# 删除中间文件
os.remove("win/xmind.b.js")
os.remove("win/xmind.js")

# 睡眠一秒
time.sleep(1)

# 切换到项目根目录
os.chdir(r"C:\Users\chiro\GolandProjects\xmindActive")

# 获取脚本运行当前路径
script_path = os.path.dirname(os.path.abspath(__file__))
source_dir = os.path.join(script_path, "win/asset")
target_dirs = [
    r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\asset",
    r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindUpdate\asset",
]
# 复制文件
for target_dir in target_dirs:
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    for file_name in os.listdir(source_dir):
        full_file_name = os.path.join(source_dir, file_name)
        if os.path.isfile(full_file_name):
            shutil.copy(full_file_name, target_dir)
            print(f"Copied {full_file_name} to {target_dir}")

# 定义要执行的 garble 和 upx 命令
commands = [
    [
        "garble",
        "-tiny",
        "build",
        "-o",
        r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\asset\xmindUpdate.exe",
        r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindUpdate",
    ],
    [
        "upx",
        "--best",
        "--lzma",
        r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\asset\xmindUpdate.exe",
    ],
    [
        "garble",
        "-tiny",
        "build",
        "-o",
        r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\dist\xmind_subscriber_changes.exe",
        r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive",
    ],
    [
        "upx",
        "--best",
        "--lzma",
        r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\dist\xmind_subscriber_changes.exe",
    ],
]
os.environ["GOARCH"] = "386"
os.environ["GOOS"] = "windows"
# 执行命令
for i, command in enumerate(commands):
    try:
        subprocess.run(command, check=True)
        print(f'Successfully ran command: {" ".join(command)}')
    except subprocess.CalledProcessError as e:
        print(f'Error running command: {" ".join(command)}\n{e}')

# 源文件路径
source_file = r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\dist\xmind_subscriber_changes.exe"

# 目标路径为桌面
desktop_path = os.path.join(os.path.join(os.environ["USERPROFILE"]), "Desktop")

# 使用shutil复制文件
try:
    shutil.copy(source_file, desktop_path)
    print(f"Successfully copied file to desktop.")
except Exception as e:
    print(f"Error copying file to desktop.\n{e}")
