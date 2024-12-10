//go:generate goversioninfo -icon=../res/icon.ico -manifest=../res/go.exe.manifest
package main

import (
	"fmt"
	"os"
	"xmindActive/cmd/xmindFix"
)

// 改变激活服务器
func changeActiveServer() {
	err := xmindFix.StartPatch()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("切换成功！")
}

// 恢复激活服务器
func restoreActiveServer() {
	err := xmindFix.Restore()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("恢复成功！")
}

func main() {
	if err := xmindFix.Prepare(); err != nil {
		fmt.Println(err)
		// 提示用户按回车键退出
		fmt.Println("按回车键退出...")
		_, _ = fmt.Scanln()
		os.Exit(0)
	}
	var choice int
	for {
		fmt.Println("------Xmind Active------")
		fmt.Println("1. 切换离线版")
		fmt.Println("2. 恢复在线版")
		fmt.Println("3. 退出")
		fmt.Println("-------------------------")
		fmt.Print("请输入对应数字,按回车确认:")
		_, err := fmt.Scan(&choice)
		if err != nil {
			fmt.Println("输入错误，请重新选择")
			continue
		}
		switch choice {
		case 1:
			changeActiveServer()
		case 2:
			restoreActiveServer()
		case 3:
			os.Exit(0)
		default:
			fmt.Println("无效选项，请重新选择！")
		}
	}
}
