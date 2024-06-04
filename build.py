import os
import shutil
import subprocess
# 切换到项目根目录
os.chdir(r"C:\Users\chiro\GolandProjects\xmindActive")

# 获取脚本运行当前路径
script_path = os.path.dirname(os.path.abspath(__file__))
source_dir = os.path.join(script_path, "asset")
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

# 交替执行命令
for i, command in enumerate(commands):
    try:
        subprocess.run(command, check=True)
        print(f'Successfully ran command: {" ".join(command)}')
    except subprocess.CalledProcessError as e:
        print(f'Error running command: {" ".join(command)}\n{e}')
