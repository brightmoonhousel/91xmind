//go:build darwin

package xmindFix

import (
	"errors"
	"os/exec"
	"path/filepath"
)

func init() {
	XmindExe = "Xmind"
	asarDir = filepath.Join("/Applications", "Xmind.app", "Contents", "Resources")
	AsarFile = filepath.Join(asarDir, "app.asar")
}
func RebootApp(processName string) {
	cmd := exec.Command("open", "-a", processName)
	_ = cmd.Run()
}
func KillProcessByName(processName string) {
	cmd := exec.Command("pkill", processName)
	_ = cmd.Run()
}
func checkEnv() error {
	// 正在改变则检查Xmind是否存在
	if !fileExists(AsarFile) {
		return errors.New("xmind is not installed")
	}
	//杀死进程
	KillProcessByName("Xmind")
	//复制win自动更新程序
	return nil
}
