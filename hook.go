package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func main3() {
	// 获取桌面路径
	desktopPath, err := os.UserHomeDir()
	fmt.Println("Desktop Path:", desktopPath)
	if err != nil {
		fmt.Println("Error getting desktop path:", err)
		return
	}

	// 创建文件路径
	a := filepath.Join(desktopPath, "Desktop")
	filePath := filepath.Join(a, "log.txt")

	// 创建文件
	file, err := os.Create(filePath)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer file.Close()

	// 写入内容
	content := []byte("This is a log file.")
	_, err = file.Write(content)
	if err != nil {
		fmt.Println("Error writing to file:", err)
		return
	}

	fmt.Println("File 'log.txt' created on the desktop.")
}
