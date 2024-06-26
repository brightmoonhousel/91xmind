package main

import (
	"fmt"
	"os"
	"path/filepath"
	goasar2 "xmindActive/cmd/goasar"
)

func main() {

	// 检查是否有命令行参数传入
	if len(os.Args) < 2 {
		fmt.Println("请拖动文件到可执行文件来运行此程序")
		return
	}

	// 获取第一个命令行参数，即拖动到可执行文件的文件路径
	fPath := os.Args[1]
	if _, err := os.Stat(fPath); err != nil {
		return
	}

	//初始化文件信息
	appAsar := goasar2.NewAsarFile(fPath)
	//读取到内存
	err := appAsar.Open()
	if err != nil {
		return
	}

	asarSys, err := goasar2.NewSimpleFileSystemByAsar(appAsar)
	if asarSys == nil {
		return
	}

	dirPath := filepath.Join(filepath.Dir(fPath), "app")
	err = asarSys.Extract(dirPath)
	if err != nil {
		return
	}
}
