package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
	"xmindActive/cmd/goasar"
)

func main() {
	start := time.Now()
	//初始化文件信息
	appAsar := goasar.NewAsarFile("C:\\Users\\chiro\\GolandProjects\\xmindActive\\cmd\\goasarCLI\\app.asar")
	//读取到内存
	err := appAsar.Open()
	if err != nil {
		return
	}

	asarSys, err := goasar.NewSimpleFileSystemByAsar(appAsar)
	asarSys.ListFiles()
	if asarSys == nil {
		return
	}

	// 计算执行时间
	duration := time.Since(start)

	// 输出执行时间
	fmt.Printf("Function execution time: %s\n", duration)
}
func Extract() {
	// 检查是否有命令行参数传入
	if len(os.Args) < 2 {
		return
	}

	// 获取第一个命令行参数，即拖动到可执行文件的文件路径
	fPath := os.Args[1]
	if _, err := os.Stat(fPath); err != nil {
		return
	}

	//初始化文件信息
	appAsar := goasar.NewAsarFile(fPath)
	//读取到内存
	err := appAsar.Open()
	if err != nil {
		return
	}

	asarSys, err := goasar.NewSimpleFileSystemByAsar(appAsar)
	if asarSys == nil {
		return
	}

	dirPath := filepath.Join(filepath.Dir(fPath), "app")
	err = asarSys.Extract(dirPath)
	if err != nil {
		return
	}
}
