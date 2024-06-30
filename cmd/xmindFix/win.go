//go:build windows

package xmindFix

import (
	"os"
	"os/exec"
	"path/filepath"
)

func init() {
	XmindExe = filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", "Xmind", "Xmind.exe")
	asarDir = filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", "Xmind", "resources")
	AsarFile = filepath.Join(asarDir, "app.asar")
	asarBackupFile = AsarFile + ".bak"
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
