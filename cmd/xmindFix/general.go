package xmindFix

import (
	"embed"
	"encoding/json"
	_ "net/http/pprof"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"xmindActive/cmd/goasar"
)

//go:embed asset/*
var asset embed.FS

var (
	XmindExe       string // xmind.exe路径
	asarDir        string // asar所在文件夹目录
	AsarFile       string // asar文件目录
	asarBackupFile string // asar备份文件目录
)

func StartPatch() error {
	// 查看备份文件是否存在，要是不存在，则说明没有激活过,备份文件
	if !FileExists(asarBackupFile) {
		// 备份文件
		_ = os.Rename(AsarFile, asarBackupFile)
	}
	return PatchAll()
}
func UpdatePatch() error {
	// 查看备份文件是否存在
	if FileExists(asarBackupFile) {
		//要是存在，删除文件
		_ = os.Remove(asarBackupFile)
	}
	//重新备份
	_ = os.Rename(AsarFile, asarBackupFile)
	return PatchAll()
}
func PatchAll() error {
	//初始化文件信息
	appAsar := goasar.NewAsarFile(asarBackupFile)
	//读取到内存
	err := appAsar.Open()
	if err != nil {
		return err
	}
	asarSys, err := goasar.NewSimpleFileSystemByAsar(appAsar)
	if err != nil {
		return err
	}

	//修改package.json文件
	packageFile, err := asarSys.GetFile("package.json")
	if err != nil {
		return err
	}
	var packageJson map[string]interface{}
	if err := json.Unmarshal(*packageFile.DataBuffer, &packageJson); err != nil {
		return err
	}
	packageJson["main"] = "main/xmind.js"
	packageJson["buildNumber"] = "202405232355"
	packageJson["version"] = "224.09.10311"
	packageJson["buildVersion"] = "224.09.10311"
	updatedData, err := json.Marshal(packageJson)
	*packageFile.DataBuffer = updatedData

	//修改about.js文件
	aboutFile, err := asarSys.GetFile(filepath.Join("renderer", "about.js"))
	if err != nil {
		return err
	}
	newAboutFileString := FixAboutVersion(string(*aboutFile.DataBuffer))
	*aboutFile.DataBuffer = []byte(newAboutFileString)

	//修改dialog-gift-card.js文件
	giftFile, err := asarSys.GetFile(filepath.Join("renderer", "dialog-gift-card.js"))
	if err != nil {
		return err
	}
	newGiftFileString := FixDialogGiftCard(string(*giftFile.DataBuffer))
	*giftFile.DataBuffer = []byte(newGiftFileString)

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
	newRuntimeFileString := strings.Replace(string(*runtimeFile.DataBuffer), `"use strict";`, `"use strict";require("./336784");`, 1)
	newRuntimeDate := []byte(newRuntimeFileString)
	*runtimeFile.DataBuffer = newRuntimeDate

	//增加xmind,js
	patchFile("main", "xmind.js", asarSys, "xmind.js")
	//增加336784.js
	patchFile("renderer", "crypto.js", asarSys, "336784.js")
	newAppAsar := asarSys.CreateAsar(AsarFile)
	err = newAppAsar.Save()
	if err != nil {
		return err
	}
	return nil
}
func patchFile(pDir string, fileName string, sys *goasar.SimpleFileSystem, alias string) {
	initDate, _ := asset.ReadFile("asset/" + fileName)
	initFile := goasar.Afile{
		Offset:     "",
		Size:       float64(len(initDate)),
		Unpacked:   false,
		Path:       filepath.Join(pDir, alias),
		IsDir:      false,
		DataBuffer: &initDate,
	}
	sys.CreateFile(&initFile)
}
func Restore() error {
	// 检查备份文件是否存在
	if !FileExists(asarBackupFile) {
		//不存在说明已经恢复了
		return nil
	}
	// 删除被修改的文件
	if FileExists(AsarFile) {
		err := os.Remove(AsarFile)
		if err != nil {
			return err
		}
	}
	//恢复备份文件
	_ = os.Rename(asarBackupFile, AsarFile)
	return nil
}
func FixDialogGiftCard(jsCode string) string {
	card, _ := asset.ReadFile("asset/" + "dialog-gift-card.fix.js")
	re := regexp.MustCompile(`handleRedeem\.*:`)
	// 使用 ReplaceAllStringFunc 进行替换
	updatedJSCode := re.ReplaceAllString(jsCode, `handleRedeem:hook,abc:`)
	fixStr := string(card) + updatedJSCode
	return fixStr
}

func FixAboutVersion(jsCode string) string {
	re := regexp.MustCompile(`formatBuildNumber\.*:`)
	return re.ReplaceAllString(jsCode, `formatBuildNumber: () =>(new Date().getFullYear().toString().slice(-2) + '.' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '.10310'),abc:`)
}

func FileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
