package main

import (
	"embed"
	"fmt"
	_ "net/http/pprof"
	"path/filepath"
	"strings"
	"time"
	"xmindActive/goasar"
)

type testFun func()

//go:embed asset/*
var asset embed.FS

func main() {
	const asarFileDir = "C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources"
	testSpeed(func() {
		//初始化文件信息
		appAsar := goasar.NewAsarFile(filepath.Join(asarFileDir, "app.asar.bk"))
		//读取到内存
		err := appAsar.Open()
		if err != nil {
			panic(err)
		}
		//创建asar文件系统
		asarSys, err := appAsar.CreateFileSys()
		if err != nil {
			panic(err)
		}
		//读取package.json文件
		packageFile, err := asarSys.GetFile("package.json")
		if err != nil {
			panic(err)
		}
		newPackageJson := strings.Replace(string(*packageFile.DataBuffer), "main.js", "init.js", 1)
		*packageFile.DataBuffer = []byte(newPackageJson)

		//读取runtime.js文件
		runtimeFile, err := asarSys.GetFile(filepath.Join("renderer", "runtime.js"))
		runtimeStr := string(*runtimeFile.DataBuffer)
		if err != nil {
			panic(err)
		}
		position := strings.Index(runtimeStr, `"use strict";`)
		insertPosition := position + len(`"use strict";`)
		newContent := `require("../crypto.b.js");`
		newRuntimeStr := runtimeStr[:insertPosition] + newContent + runtimeStr[insertPosition:]
		fmt.Println(newRuntimeStr)
		newRuntimeDate := []byte(newRuntimeStr)
		*runtimeFile.DataBuffer = newRuntimeDate

		patch("init.js", "main", asarSys)
		patch("hook.js", "main", asarSys)
		patch("crypto.b.js", "", asarSys)

		newAppAsar := asarSys.CreateAsar(filepath.Join(asarFileDir, "app.asar"))
		err = newAppAsar.Save()
		if err != nil {
			panic(err)
		}
	})
}

// 父目录 上级目录
func patch(fileName string, pDir string, sys *goasar.SimpleFileSystem) {
	initDate, _ := asset.ReadFile("asset/" + fileName)
	initFile := goasar.Afile{
		Offset:     "",
		Size:       float64(len(initDate)),
		Unpacked:   false,
		Path:       filepath.Join(pDir, fileName),
		IsDir:      false,
		DataBuffer: &initDate,
	}
	sys.CreateFile(&initFile)
}

func testSpeed(testFun testFun) {
	start := time.Now()
	testFun()
	elapsed := time.Since(start)
	fmt.Println("耗时：", elapsed)
}
