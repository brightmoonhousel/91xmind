package main

import (
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
		asarDir = "/Applications/Xmind.app/Contents/Resources"
		asarFile = asarDir + "/app.asar"
		asarBackupFile = hideFile(asarFile + ".bak")
		xmindExe = "Xmind"
	}
}

func check() error {
	switch systemEnvironment {
	case win:
		// 检查Xmind是否存在
		if _, err := os.Stat(asarFile); err != nil {
			return errors.New("xmind is not installed")
		}
		//杀死进程
		killProcessByName("Xmind.exe")
		//复制自动更新程序
		winCopyUpdateFile()
		//创建隐藏激活信息文件
		winCreateHiddenFile()
	case mac:
		if _, err := os.Stat(asarFile); err != nil {
			return errors.New("xmind is not installed")
		}
		//杀死进程
		killProcessByName("Xmind")
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
	// 如果是win 设置隐藏备份文件
	if systemEnvironment == win {
		_ = hideFile(asarBackupFile)
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
	patch("main", "xmind.b.js", asarSys, "xmind.js")
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

func killProcessByName(processName string) {
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
		killCmd = "pkill"
		processArg = []string{processName}
	case linux:
		killCmd = "pkill"
		processArg = []string{processName}
	}
	cmd := exec.Command(killCmd, processArg...)
	_ = cmd.Run()
}
func rebootApp(processName string) {
	// 根据操作系统设置相应的命令和参数
	var cmd *exec.Cmd
	switch systemEnvironment {
	case win:
		cmd = exec.Command(processName)
	case mac:
		cmd = exec.Command("open", "-a", processName)
	case linux:
		//[鹿鱼][2024/6/5]TODO:
	}
	if cmd != nil {
		_ = cmd.Run()
	}

}

// win专属
func winCopyUpdateFile() {
	updateFile, _ := asset.ReadFile("asset/xmindUpdate.exe")
	appData := os.Getenv("APPDATA")
	_ = os.MkdirAll(filepath.Join(appData, "Xmind"), os.ModePerm)
	file, _ := os.Create(filepath.Join(appData, "Xmind", "xmindUpdate.exe"))
	defer file.Close()
	_, _ = file.Write(updateFile)
}
func winCreateHiddenFile() {
	path := filepath.Join(os.Getenv("USERPROFILE"), "user.log")
	if _, err := os.Stat(path); err != nil {
		// 创建文件
		file, _ := os.Create(path)
		file.Close()
	}
	_ = hideFile(path)
}
