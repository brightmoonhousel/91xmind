//go:build windows

package main

import (
	"embed"
	"errors"
	"golang.org/x/sys/windows"
	"os"
	"os/exec"
	"path/filepath"
)

//go:embed asset/*
var asset embed.FS

func init() {
	// 获取当前用户的本地应用数据目录
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		return
	}
	xmindExe = filepath.Join(localAppData, "Programs", "Xmind", "Xmind.exe")
	asarDir = filepath.Join(localAppData, "Programs", "Xmind", "resources")
	asarFile = filepath.Join(asarDir, "app.asar")
	asarBackupFile = asarFile + ".bak"
}

func checkEnv() error {
	// 检查Xmind是否存在
	if _, err := os.Stat(asarFile); err != nil {
		return errors.New("xmind is not installed")
	}
	//杀死进程
	killProcessByName("Xmind.exe")
	//复制win自动更新程序
	winCopyUpdateFile()
	return nil
}

func removeHiddenAttribute(filename string) string {
	// 获取当前文件属性
	attrs, err := windows.GetFileAttributes(windows.StringToUTF16Ptr(filename))
	if err != nil {
		return filename
	}

	// 检查是否设置了隐藏属性
	if attrs&windows.FILE_ATTRIBUTE_HIDDEN != 0 {
		// 移除隐藏属性
		newAttrs := attrs &^ windows.FILE_ATTRIBUTE_HIDDEN
		err = windows.SetFileAttributes(windows.StringToUTF16Ptr(filename), newAttrs)
		if err != nil {
			return filename
		}

	}
	return filename
}

// 复制更新程序
func winCopyUpdateFile() {
	updateFile, _ := asset.ReadFile("asset/xmindUpdate.exe")
	appData := os.Getenv("APPDATA")
	_ = os.MkdirAll(filepath.Join(appData, "Xmind"), os.ModePerm)
	file, _ := os.Create(filepath.Join(appData, "Xmind", "xmindUpdate.exe"))
	defer file.Close()
	_, _ = file.Write(updateFile)
}

func rebootApp(processName string) {
	cmd := exec.Command(processName)
	_ = cmd.Run()
}

func killProcessByName(processName string) {
	processArg := []string{"-f", "-t", "-im", processName}
	cmd := exec.Command("taskkill", processArg...)
	_ = cmd.Run()
}
