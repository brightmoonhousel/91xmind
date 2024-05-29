package main

import (
	"fmt"
	_ "net/http/pprof"
	"os"
	"time"
	"xmindActive/goasar"
)

type testFun func()

func main() {
	//files := []goasar.Afile{
	//	{Path: "aa.js", Offset: "0", Size: 0, Unpacked: false, IsDir: false},
	//	{Path: "usr/bin/ls", Offset: "0", Size: 100, Unpacked: true, IsDir: true},
	//	{Path: "usr/bin/as", Offset: "0", Size: 100, Unpacked: true, IsDir: true},
	//	{Path: "usr/as", Offset: "0", Size: 100, Unpacked: true, IsDir: false},
	//}

	testSpeed(func() {
		asar1 := goasar.NewAsarFile("C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app.asar.bk")
		_ = asar1.Open()
		sys, _ := asar1.CreateFileSys()
		getFile, err := sys.GetFile("main\\main.bytecode")
		if err != nil {
			panic(err)
		}
		fmt.Println(getFile)
		//将二进制数据写入文件
		file, err := os.Create("./main.bytecode")
		if err != nil {
			panic(err)
		}
		defer file.Close()
		file.Write(*getFile.DataBuffer)
		//asar := sys.CreateAsar("C:\\Users\\chiro\\AppData\\Local\\Programs\\Xmind\\resources\\app.asar")
		//asar.Save()
		//sys, _ = asar.CreateFileSys()
		//file, _ := sys.GetFile("package.json")
		//buffer := file.DataBuffer
		//fmt.Println(string(*buffer))

	})

}

func testSpeed(testFun testFun) {
	start := time.Now()
	testFun()
	elapsed := time.Since(start)
	fmt.Println("该函数执行完成耗时：", elapsed)
}
