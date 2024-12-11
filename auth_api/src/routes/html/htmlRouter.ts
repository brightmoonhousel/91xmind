import { Hono, Context } from "hono";
import { html } from "hono/html";
const getHtml = async (c: Context) => {
  return c.html(
    html`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>兑换码换绑</title>
    <style>
        body {font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #000;}
        .container {text-align: center; width: 400px; height: 200px; background-color: #333; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); color: white;}
        h1 {font-size: 24px; color: #fff;}
        input[type="text"] {width: 93%; padding: 10px; font-size: 16px; text-align: center; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #222; color: white;}
        button {width: 100%; padding: 10px; font-size: 16px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;}
        button:hover {background-color: #0056b3;}
        .message {margin-top: 20px; text-align: center; font-size: 14px;}
    </style>
</head>
<body>
    <div class="container">
        <h1>兑换码换绑</h1>
        <input type="text" id="activationCode" placeholder="请输入兑换码">
        <button onclick="throttledUnbindActivation()">解绑</button>
        <div class="message" id="message"></div>
    </div>
    <script>
        let throttleTimer, lastExecutionTime = 0, throttleDelay = 3000;
        const messageDiv = document.getElementById('message');
        function throttledUnbindActivation() {
            const currentTime = Date.now();
            if (currentTime - lastExecutionTime < throttleDelay) {
                document.getElementById('activationCode').value = "";
                messageDiv.textContent = "操作过快,请稍后再试";
                messageDiv.style.color = 'red';
                return;
            }
            messageDiv.textContent = "";
            lastExecutionTime = currentTime;
            unbindActivation();
        }
        function unbindActivation() {
            const activationCode = document.getElementById('activationCode').value;
            const activationCodePattern = /^[A-Fa-f0-9]{6}-[A-Fa-f0-9]{6}-[A-Fa-f0-9]{6}-[A-Fa-f0-9]{6}$/;
            messageDiv.textContent = "";
            if (!activationCode) {
                messageDiv.textContent = "兑换码不能为空";
                messageDiv.style.color = 'red';
                return;
            }
            if (!activationCodePattern.test(activationCode)) {
                messageDiv.textContent = "兑换码格式错误";
                messageDiv.style.color = 'red';
                return;
            }
            fetch('/unbind', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ unbindCode:activationCode })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('activationCode').value = "";
                messageDiv.textContent = data?.code==200 ? "解绑成功" : "兑换码不存在或已被解绑";
                messageDiv.style.color = data?.code==200 ? 'green' : 'yellow';
            })
            .catch(error => {
                console.error('Error:', error);
                messageDiv.textContent = "请求失败，请稍后重试";
                messageDiv.style.color = 'red';
            });
        }
    </script>
</body>
</html>
`);
};
export const htmlRouter = new Hono();
htmlRouter.get("/", getHtml);
