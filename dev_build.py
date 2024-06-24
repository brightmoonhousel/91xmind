import os
import subprocess

# 读取 hook.js 和 init.js 的内容
with open("./hook.js", "r", encoding="utf-8") as f:
    hook_content = f.read()
with open("./init.js", "r", encoding="utf-8") as f:
    init_content = f.read()
xmind_content = hook_content + init_content
# 将拼接后的内容保存为 xmind.b.js
with open("xmind.b.js", "w", encoding="utf-8") as f:
    f.write(xmind_content)
# 执行 javascript-obfuscator
os.system("javascript-obfuscator xmind.b.js --config ob.json -o xmind.b.js")
# 读取 js-yaml.min.js 的内容
with open("./lib/js-yaml.min.js", "r", encoding="utf-8") as f:
    yaml_content = f.read()
# 读取 xmind.b.js 的内容
with open("xmind.b.js", "r", encoding="utf-8") as f:
    xmind_b_content = f.read()
# 在 xmind.b.js 文件前面插入 js-yaml.min.js 的内容
new_content = yaml_content + xmind_b_content
# 将新内容保存到 xmind.b.js 文件中
with open("xmind.b.js", "w", encoding="utf-8") as f:
    f.write(new_content)


command= [r"C:\Users\chiro\AppData\Local\Programs\Xmind\Xmind.exe","@"]
subprocess.run(command, check=True)
