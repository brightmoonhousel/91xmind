package main

import (
	"embed"
	"errors"
	_ "net/http/pprof"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	goasar2 "xmindActive/cmd/goasar"
)

const (
	win   = iota // 0
	mac          // 1
	linux        // 2
)

var (
	systemEnvironment int    // 0:windows 1:mac 2:linux
	xmindExe          string // xmind.exe路径
	asarDir           string // asar所在文件夹目录
	asarFile          string // asar文件目录
	asarBackupFile    string // asar备份文件目录
)

func init() {
	switch goos := runtime.GOOS; goos {
	case "windows":
		systemEnvironment = win
		// 获取当前用户的本地应用数据目录
		localAppData := os.Getenv("LOCALAPPDATA")
		if localAppData == "" {
			panic(errors.New("environment variable LOCALAPPDATA not found"))
		}
		// C:\Users\chiro\AppData\Local\Programs\Xmind\Xmind.exe
		xmindExe = filepath.Join(localAppData, "Programs", "Xmind", "Xmind.exe")
		// C:\Users\chiro\AppData\Local\Programs\Xmind\resources
		asarDir = filepath.Join(localAppData, "Programs", "Xmind", "resources")
		// C:\Users\chiro\AppData\Local\Programs\Xmind\resources\app.asar
		asarFile = filepath.Join(asarDir, "app.asar")
		// C:\Users\chiro\AppData\Local\Programs\Xmind\resources\app.asar.bak
		asarBackupFile = asarFile + ".bak"
	case "linux":
		systemEnvironment = linux
	case "darwin":
		systemEnvironment = mac
	}
}

//go:embed asset/*
var asset embed.FS

func check() error {
	switch systemEnvironment {
	case win:
		KillProcessByName("Xmind.exe")
		winCopyUpdateFile()
		// 检查Xmind是否存在
		if _, err := os.Stat(asarFile); err != nil {
			return errors.New("xmind is not installed")
		}
	case mac: //[鹿鱼][2024/6/1]TODO:
	case linux: //[鹿鱼][2024/6/1]TODO:
	}
	return nil
}
func start() error {
	// 查看备份文件是否存在，要是不存在，则说明没有激活过
	if _, err := os.Stat(asarBackupFile); err != nil {
		// 备份文件
		_ = os.Rename(asarFile, asarBackupFile)
	}
	//初始化文件信息
	appAsar := goasar2.NewAsarFile(asarBackupFile)
	//读取到内存
	err := appAsar.Open()
	if err != nil {
		return err
	}
	asarSys, err := goasar2.NewSimpleFileSystemByAsar(appAsar)
	if err != nil {
		return err
	}
	//修改package.json文件
	packageFile, err := asarSys.GetFile("package.json")
	if err != nil {
		return err
	}
	newPackageJson := strings.Replace(string(*packageFile.DataBuffer), "main.js", "xmind.js", 1)
	*packageFile.DataBuffer = []byte(newPackageJson)
	//修改runtime.js文件
	runtimeFile, err := asarSys.GetFile(filepath.Join("renderer", "runtime.js"))
	if err != nil {
		return err
	}
	runtimeStr := string(*runtimeFile.DataBuffer)
	position := strings.Index(runtimeStr, `"use strict";`)
	insertPosition := position + len(`"use strict";`)
	newContent := `require("./336784");`
	newRuntimeStr := runtimeStr[:insertPosition] + newContent + runtimeStr[insertPosition:]
	newRuntimeDate := []byte(newRuntimeStr)
	*runtimeFile.DataBuffer = newRuntimeDate
	patch("main", "xmind.js", asarSys, "xmind.js")
	patch("renderer", "crypto.js", asarSys, "336784.js")
	newAppAsar := asarSys.CreateAsar(asarFile)
	err = newAppAsar.Save()
	if err != nil {
		return err
	}
	return nil
}
func patch(pDir string, fileName string, sys *goasar2.SimpleFileSystem, alias string) {
	initDate, _ := asset.ReadFile("asset/" + fileName)
	initFile := goasar2.Afile{
		Offset:     "",
		Size:       float64(len(initDate)),
		Unpacked:   false,
		Path:       filepath.Join(pDir, alias),
		IsDir:      false,
		DataBuffer: &initDate,
	}
	sys.CreateFile(&initFile)
}
func restore() error {
	// 检查备份文件是否存在
	if _, err := os.Stat(asarBackupFile); err != nil {
		//不存在说明已经恢复了
		return nil
	}
	// 删除文件
	err := os.Remove(asarFile)
	if err != nil {
		return err
	}
	//恢复备份文件
	_ = os.Rename(asarBackupFile, asarFile)
	return nil
}

// KillProcessByName closes a process by its name
func KillProcessByName(processName string) {
	var (
		killCmd    string
		processArg []string
	)
	// 根据操作系统设置相应的命令和参数
	switch systemEnvironment {
	case win:
		killCmd = "taskkill"
		processArg = []string{"-f", "-t", "-im", processName}
	case mac:
		killCmd = "killall"
		//[鹿鱼][2024/6/2]TODO:
	case linux:
		killCmd = "pkill"
		//[鹿鱼][2024/6/2]TODO:
	}
	cmd := exec.Command(killCmd, processArg...)
	_ = cmd.Run()
}
func winCopyUpdateFile() {
	updateFile, _ := asset.ReadFile("asset/update.exe")
	appData := os.Getenv("APPDATA")
	_ = os.MkdirAll(filepath.Join(appData, "Xmind"), os.ModePerm)
	file, _ := os.Create(filepath.Join(appData, "Xmind", "update.exe"))
	defer file.Close()
	_, _ = file.Write(updateFile)
}
