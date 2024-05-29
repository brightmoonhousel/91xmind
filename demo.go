package main

import (
	"fmt"
	"os"
	"runtime"
	"strings"
	"time"
)

type XmindPath struct {
	appDirPath   string
	asarFilePath string
	unpackPath   string
}

var (
	systemEnv = runtime.GOOS // 获取当前操作系统
	xmindPath XmindPath
)

func init() {
	switch systemEnv {
	case "windows":
		fmt.Println("当前系统是 Windows")
		userProfile := os.Getenv("USERPROFILE")
		xmindPath.appDirPath = userProfile + "\\AppData\\Local\\Programs\\Xmind\\resources\\app"
		xmindPath.asarFilePath = userProfile + "\\AppData\\Local\\Programs\\Xmind\\resources\\app.asar"
		xmindPath.unpackPath = userProfile + "\\AppData\\Local\\Programs\\Xmind\\resources\\app.asar.unpacked"
	case "darwin":
		fmt.Println("当前系统是 macOS")
		//TODO
	case "linux":
		fmt.Println("当前系统是 Linux")
		//TODO
	default:
		fmt.Println("无法识别的操作系统")
		os.Exit(1) // 退出程序
	}
}

func main() {

	//appPath := "C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app"
	//asarFile := "C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app.asar"
	start := time.Now() // 获取当前时间
	//goasar.ListAsarFiles("C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app.asar.bk")

	//goasar.CopyDir("C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app.asar.unpacked", "C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app")

	//goasar.ExtractAsar(asarFile, appPath)
	//goasar.PackAsar(appPath, asarFile)
	//replaceFileString(
	//	"C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app\\renderer\\dialog-gift-card.js",
	//	"./s.js",
	//	"Subscription Info",
	//	"")
	elapsed := time.Since(start)
	fmt.Println("该函数执行完成耗时：", elapsed)

}

func replaceFileString(filePath string, outputPath string, oldStr string, newStr string) {
	// 读取整个文件内容
	content, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Println("无法读取文件:", err)
		return
	}

	// 将文件内容转换为字符串
	text := string(content)

	index := strings.Index(text, oldStr)
	if index == -1 {
		fmt.Println("未找到要替换的字符串:", oldStr)
		return
	}
	text = text[:index] + newStr + text[index+len(oldStr):]

	// 创建一个新文件用于保存替换后的内容
	outputFile, err := os.Create(outputPath)
	if err != nil {
		fmt.Println("创建输出文件失败:", err)
		return
	}
	defer outputFile.Close()

	// 将替换后的字符串写入输出文件
	_, err = outputFile.WriteString(text)
	if err != nil {
		fmt.Println("写入文件失败:", err)
		return
	}

	fmt.Println("替换完成，结果已保存到 output.txt 文件")
}
