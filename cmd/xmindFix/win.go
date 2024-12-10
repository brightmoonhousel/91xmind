//go:build windows

package xmindFix

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
)

func init() {
	XmindExe = filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", "Xmind", "Xmind.exe")
	asarDir = filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", "Xmind", "resources")
	AsarFile = filepath.Join(asarDir, "app.asar")
}
func RebootApp(processName string) {
	cmd := exec.Command(processName)
	_ = cmd.Run()
}
func KillProcessByName(processName string) {
	processArg := []string{"-f", "-t", "-im", processName}
	cmd := exec.Command("taskkill", processArg...)
	_ = cmd.Run()
}

func checkEnv() error {
	// 正在改变则检查Xmind是否存在
	if !fileExists(AsarFile) {
		return errors.New("xmind is not installed")
	}
	//杀死进程
	KillProcessByName("Xmind.exe")
	return nil
}
