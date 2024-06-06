//go:build darwin

package main

import (
	"embed"
	"errors"
	"os"
	"os/exec"
	"path"
)

//go:embed asset/*.js
var asset embed.FS

func init() {
	asarDir = "/Applications/Xmind.app/Contents/Resources"
	asarFile = asarDir + "/app.asar"
	asarBackupFile = hideFile(asarFile + ".bak")
	xmindExe = "Xmind"
}
func checkEnv() error {
	if _, err := os.Stat(asarFile); err != nil {
		return errors.New("xmind is not installed")
	}
	//杀死进程
	killProcessByName("Xmind")
	return nil
}
func hideFile(filename string) string {
	dir, file := path.Split(filename)
	return path.Join(dir, "."+file)
}

func removeHiddenAttribute(filename string) string {
	return filename
}

func rebootApp(processName string) {
	cmd := exec.Command("open", "-a", processName)
	_ = cmd.Run()
}

func killProcessByName(processName string) {
	cmd := exec.Command("pkill", processName)
	_ = cmd.Run()
}
