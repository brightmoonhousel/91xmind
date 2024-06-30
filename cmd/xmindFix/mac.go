//go:build darwin

package xmindFix

import (
	"os/exec"
	"path/filepath"
)

func init() {
	XmindExe = "Xmind"
	asarDir = filepath.Join("/Applications", "Xmind.app", "Contents", "Resources")
	AsarFile = filepath.Join(asarDir, "app.asar")
	asarBackupFile = AsarFile + ".bak"
}
func RebootApp(processName string) {
	cmd := exec.Command("open", "-a", processName)
	_ = cmd.Run()
}
func KillProcessByName(processName string) {
	cmd := exec.Command("pkill", processName)
	_ = cmd.Run()
}
