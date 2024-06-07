import os
import shutil
import subprocess
import time
# 设置环境变量
os.environ["GOARCH"] = "amd64"
os.environ["GOOS"] = "darwin"

# 读取 hook.js 和 init.js 的内容
with open("mac/hook.js", "r", encoding="utf-8") as f:
    hook_content = f.read()
with open("general/init.js", "r", encoding="utf-8") as f:
    init_content = f.read()
# 拼接内容
xmind_content = hook_content + init_content
# 将拼接后的内容保存为 xmind.js
with open("mac/xmind.js", "w", encoding="utf-8") as f:
    f.write(xmind_content)
# 执行 javascript-obfuscator
os.system("javascript-obfuscator mac/xmind.js --config ob.json -o mac/asset/xmind.b.js")
# 删除中间文件
os.remove("mac/xmind.js")

# 睡眠一秒
time.sleep(1)

# 切换到项目根目录
os.chdir(r"C:\Users\chiro\GolandProjects\xmindActive")

# 获取脚本运行当前路径
script_path = os.path.dirname(os.path.abspath(__file__))
source_dir = os.path.join(script_path, "mac/asset")
target_dirs = [
    r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\asset",
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



activeFileSrc = r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive"
activeFileDist = r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive\dist\xmind_server_changes_mac"
outfile = os.path.join(
    os.environ["USERPROFILE"],
    "Desktop",
    "xmind_server_changes_win.exe",
)
# 定义要执行的 garble 和 upx 命令
commands = [
    [
        "garble",
        "-tiny",
        "build",
        "-o",
        activeFileDist,
        activeFileSrc,
    ],
    [
        "upx",
        "--best",
        "--lzma",
        "-o",
        outfile,
        activeFileDist,
        "--force-macos",
    ],
]

os.remove(outfile)

# 执行命令
for i, command in enumerate(commands):
    try:
        subprocess.run(command, check=True)
        print(f'Successfully ran command: {" ".join(command)}')
    except subprocess.CalledProcessError as e:
        print(f'Error running command: {" ".join(command)}\n{e}')