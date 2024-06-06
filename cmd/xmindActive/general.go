package main

import (
	_ "net/http/pprof"
	"os"
	"path/filepath"
	"strings"
	goasar2 "xmindActive/cmd/goasar"
)

var (
	xmindExe       string // xmind.exe路径
	asarDir        string // asar所在文件夹目录
	asarFile       string // asar文件目录
	asarBackupFile string // asar备份文件目录
)

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
	//修改dialog-gift-card.js文件
	giftFile, err := asarSys.GetFile(filepath.Join("renderer", "dialog-gift-card.js"))
	if err != nil {
		return err
	}
	gift, _ := asset.ReadFile("asset/" + "dialog-gift-card.js")
	giftFile.DataBuffer = &gift
	//修改dialog-signin.js
	signinFile, err := asarSys.GetFile(filepath.Join("renderer", "dialog-signin.js"))
	if err != nil {
		return err
	}
	signin, _ := asset.ReadFile("asset/" + "dialog-signin.js")
	signinFile.DataBuffer = &signin
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
	//取消隐藏
	removeHiddenAttribute(asarBackupFile)
	_ = os.Rename(asarBackupFile, asarFile)
	return nil
}
