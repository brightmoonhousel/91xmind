//go:build windows

package main

import (
	"embed"
	"errors"
	"os"
	"path/filepath"
	"xmindActive/cmd/hookFilePatch"
)

//go:embed asset/*.exe
var asset embed.FS

func checkEnv() error {
	// 检查Xmind是否存在
	if !hookFilePatch.FileExists(hookFilePatch.AsarFile) {
		return errors.New("xmind is not installed")
	}
	//杀死进程
	hookFilePatch.KillProcessByName("Xmind.exe")
	//复制win自动更新程序
	winCopyUpdateFile()
	return nil
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
