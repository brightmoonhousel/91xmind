package hookFilePatch

import (
	"embed"
	_ "net/http/pprof"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	goasar2 "xmindActive/cmd/goasar"
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
	//读取package.json文件字符串并替换
	newPackageString := strings.Replace(string(*packageFile.DataBuffer), "main.js", "xmind.js", 1)
	//转为[]byte保存
	*packageFile.DataBuffer = []byte(newPackageString)
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
	runtimeStr := string(*runtimeFile.DataBuffer)
	position := strings.Index(runtimeStr, `"use strict";`)
	insertPosition := position + len(`"use strict";`)
	newContent := `require("./336784");`
	newRuntimeStr := runtimeStr[:insertPosition] + newContent + runtimeStr[insertPosition:]
	newRuntimeDate := []byte(newRuntimeStr)
	*runtimeFile.DataBuffer = newRuntimeDate
	patchFile("main", "xmind.b.js", asarSys, "xmind.js")
	patchFile("renderer", "crypto.js", asarSys, "336784.js")
	newAppAsar := asarSys.CreateAsar(AsarFile)
	err = newAppAsar.Save()
	if err != nil {
		return err
	}
	return nil
}
func patchFile(pDir string, fileName string, sys *goasar2.SimpleFileSystem, alias string) {
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
func Restore() error {
	// 检查备份文件是否存在
	if !FileExists(asarBackupFile) {
		//不存在说明已经恢复了
		return nil
	}
	// 删除被修改的文件
	err := os.Remove(AsarFile)
	if err != nil {
		return err
	}
	//恢复备份文件
	_ = os.Rename(asarBackupFile, AsarFile)
	return nil
}
func FixDialogGiftCard(jsCode string) string {
	fixStr := `handleRedeem: async () => {
  const a = xxx;
  try {
    await a.fetch("POST /xos/redeem-sub");
    const res = await a.fetch("POST /xos/devices");
    await a.fetch("POST /pinia/store/mutations", {
      mutations: [
        {
          id: "account",
          type: "updateAccount",
          payload: [{ rawSubscriptionData: res.rawData }]
        }
      ]
    });
    a.fetch("POST /windows", {
      name: "dialog-congratulate"
    });
  } catch (e) {}
  window.close();
},showSubscriptionInfo:`
	fixStr = strings.ReplaceAll(fixStr, "\n", "")
	// 第一阶段：匹配 handleContinue 到 handleRedeem 之间的部分
	re1 := regexp.MustCompile(`handleContinue:.*handleRedeem`)
	matches1 := re1.FindString(jsCode)
	// 第二阶段：在匹配到的部分中再匹配 \w*\.\w*\.fetch
	re2 := regexp.MustCompile(`(\w*\.\w*)\.fetch`)
	matches2 := re2.FindStringSubmatch(matches1)
	fetchPattern := matches2[1] // 提取到的 \w*\.\w* 部分

	fixStr = strings.Replace(fixStr, "xxx", fetchPattern, 1)
	re3 := regexp.MustCompile(`handleRedeem:.*showSubscriptionInfo:`)
	return re3.ReplaceAllString(jsCode, fixStr)
}
func FileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
