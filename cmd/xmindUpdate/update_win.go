//go:build !update

package main

import (
	"embed"
	_ "embed"
	"fmt"
	"gopkg.in/yaml.v3"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	goasar2 "xmindActive/cmd/goasar"
)

const (
	getUpdateUrl = "https://xmind.cn/xmind/update/latest-win64.yml" // 获取更新exe下载链接的链接
	exeName      = "Xmind.exe"
)

var (
	xmindDir            string // xmind路径
	asarDir             string // asar所在文件夹目录
	asarFile            string // asar文件目录
	asarBackupFile      string // asar备份文件目录
	sevenZip            string // 7zr.exe文件目录
	xmindUpdateFileName string // 更新exe文件名
)

//go:embed asset/*
var asset embed.FS

func init() {
	// 获取当前用户的本地应用数据目录
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		return
	}
	// C:\Users\chiro\AppData\Local\Programs\Xmind\Xmind.exe
	xmindDir = filepath.Join(localAppData, "Programs", "Xmind")
	// C:\Users\chiro\AppData\Local\Programs\Xmind\resources
	asarDir = filepath.Join(xmindDir, "resources")
	// C:\Users\chiro\AppData\Local\Programs\Xmind\resources\app.asar
	asarFile = filepath.Join(asarDir, "app.asar")
	// C:\Users\chiro\AppData\Local\Programs\Xmind\resources\app.asar.bak
	asarBackupFile = asarFile + ".bak"
	//  C:\Users\chiro\AppData\Local\Programs\Xmind\7zr.exe
	sevenZip = filepath.Join(xmindDir, "7zr.exe")
	//  C:\Users\chiro\AppData\Local\Programs\Xmind\latest.exe
	xmindUpdateFileName = filepath.Join(xmindDir, "latest.exe")
}

func main() {
	// 释放解压程序
	fmt.Println("正在释放7z解压程序")
	out7z, err := os.Create(sevenZip)
	if err != nil {
		return
	}
	readFile, err := asset.ReadFile("asset/7zr.exe")
	if err != nil {
		return
	}
	_, err = out7z.Write(readFile)
	if err != nil {
		return
	}
	//获取下载链接
	fmt.Println("正在获取下载链接")
	resp, err := http.Get(getUpdateUrl)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("failed to read response body: %v", err)
	}
	var updateYml map[string]interface{}
	err = yaml.Unmarshal(body, &updateYml)
	//开始下载
	fmt.Println("获取成功，开始下载更新文件")
	err = downloadFile(updateYml["url"].(string), xmindUpdateFileName)
	if err != nil {
		return
	}
	fmt.Println("下载完毕，关闭xmind线程")
	KillProcessByName(exeName)
	//开始解压覆盖
	fmt.Println("开始解压")
	cmd := exec.Command(sevenZip, "x", xmindUpdateFileName, "-o"+xmindDir, "-aoa")
	err = cmd.Run()
	if err != nil {
		return
	}
	//开始更新
	fmt.Println("覆盖完成，开始更新")
	err = updateStart()
	if err != nil {
		return
	}
	fmt.Println("更新完毕，删除缓存")
	// 删除更新缓存
	err = os.Remove(xmindUpdateFileName)
	if err != nil {
		return
	}
	err = os.Remove(sevenZip)
	if err != nil {
		return
	}
}

func downloadFile(url string, filename string) error {
	dir := filepath.Dir(filename)
	// 创建目标目录（如果不存在）
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create directory: %v", err)
	}
	// 创建文件
	out, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create file: %v", err)
	}
	defer out.Close()
	// 发送HTTP GET请求
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download file: %v", err)
	}
	defer resp.Body.Close()
	// 检查HTTP响应状态码
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}
	// 将响应主体复制到文件
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to write to file: %v", err)
	}
	return nil
}
func updateStart() error {
	// 查看备份文件是否存在
	if _, err := os.Stat(asarBackupFile); err != nil {
		// 存在，删除之前的
		_ = os.Remove(asarBackupFile)
	}
	_ = os.Rename(asarFile, asarBackupFile)
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
	patch("main", "xmind.js", asarSys)
	patch("renderer", "336784.js", asarSys)
	newAppAsar := asarSys.CreateAsar(asarFile)
	err = newAppAsar.Save()
	if err != nil {
		return err
	}
	return nil
}
func patch(pDir string, fileName string, sys *goasar2.SimpleFileSystem) {
	initDate, _ := asset.ReadFile("asset/" + fileName)
	initFile := goasar2.Afile{
		Offset:     "",
		Size:       float64(len(initDate)),
		Unpacked:   false,
		Path:       filepath.Join(pDir, fileName),
		IsDir:      false,
		DataBuffer: &initDate,
	}
	sys.CreateFile(&initFile)
}

// KillProcessByName closes a process by its name
func KillProcessByName(processName string) {
	cmd := exec.Command("taskkill", "-f", "-t", "-im", processName)
	_ = cmd.Run()
}
