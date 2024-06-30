//go:build darwin

package main

import (
	"errors"
	"xmindActive/cmd/xmindFix"
)

func checkEnv(isPatching bool) error {
	// 正在改变则检查Xmind是否存在
	if isPatching && !xmindFix.FileExists(xmindFix.AsarFile) {
		return errors.New("xmind is not installed")
	}
	//杀死进程
	xmindFix.KillProcessByName("Xmind")
	//复制win自动更新程序
	return nil
}
