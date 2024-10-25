import os
import shutil
import subprocess

#subprocess.run(r"node C:\Users\chiro\AppData\Local\Programs\Xmind\resources\app\main\build\build.js")

#设置环境变量
os.environ["GOARCH"] = "amd64"
os.environ["GOOS"] = "windows"

xmindActiveSrc = r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindActive"
activeFileDist = os.path.join(xmindActiveSrc,"dist","xmindActive_Win.exe")

xmindUpdateSrc = r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindUpdate"
updateFileDist = os.path.join(xmindActiveSrc,"asset","xmindUpdate.exe")

hookFilePatch = r"C:\Users\chiro\GolandProjects\xmindActive\cmd\xmindFix"

# 获取脚本运行当前路径
script_path = os.path.dirname(os.path.abspath(__file__))
source_dir = os.path.join(script_path, "asset")
target_dirs = [
    os.path.join(hookFilePatch, "asset"),
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


outfile = os.path.join(
    os.environ["USERPROFILE"],
    "Desktop",
    "xmindActive_Win.exe",
)

# 定义要执行的 garble 和 upx 命令
commands = [
    # [
    #     "garble",
    #     "-tiny",
    #     "build",
    #     "-o",
    #     updateFileDist,
    #     xmindUpdateSrc,
    # ],
    # [
    #     "upx",
    #     "--best",
    #     "--lzma",
    #     updateFileDist,
    # ],
    # [
    #     "garble",
    #     "-tiny",
    #     "build",
    #     "-o",
    #     activeFileDist,
    #     xmindActiveSrc,
    # ],
    [
        "upx",
        "--best",
        "--lzma",
        "-o",
        outfile,
        activeFileDist,
    ],
]
if os.path.exists(outfile):
    os.remove(outfile)
# 执行命令
# 切换到项目根目录
os.chdir(r"C:\Users\chiro\GolandProjects\xmindActive")

for i, command in enumerate(commands):
    try:
        subprocess.run(command, check=True)
        print(f'Successfully ran command: {" ".join(command)}')
    except subprocess.CalledProcessError as e:
        print(f'Error running command: {" ".join(command)}\n{e}')
