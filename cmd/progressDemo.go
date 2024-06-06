package main

import (
	"fmt"
	"golang.org/x/sys/windows"
	"os"
	"os/exec"
	"path/filepath"
	"time"
	"unsafe"
)

// 如果大于一个更新程序则退出
func checkSelfRunning() {
	fullPath := os.Args[0]
	selfName := filepath.Base(fullPath)
	count := countProcessRunning(selfName)
	if count > 1 {
		os.Exit(0)
	}
}
func init() {
	checkSelfRunning()
}

func main() {
	exeName := "Xmind.exe"
	for {
		running := isProcessRunning(exeName)
		fmt.Println(running)
		time.Sleep(time.Second)
		if running {
			KillProcessByName(exeName)
			cmd := exec.Command("msg", "*", "Xmind正在更新，稍后自动开启")
			_ = cmd.Run()
		}
	}
}

func isProcessRunning(exeName string) bool {
	snapshot, err := windows.CreateToolhelp32Snapshot(windows.TH32CS_SNAPPROCESS, 0)
	if err != nil {
		fmt.Printf("CreateToolhelp32Snapshot failed: %v\n", err)
		return false
	}
	defer windows.CloseHandle(snapshot)

	var processEntry windows.ProcessEntry32
	processEntry.Size = uint32(unsafe.Sizeof(processEntry))

	for err := windows.Process32First(snapshot, &processEntry); err == nil; err = windows.Process32Next(snapshot, &processEntry) {
		if windows.UTF16ToString(processEntry.ExeFile[:]) == exeName {
			return true
		}
	}

	return false
}
func countProcessRunning(exeName string) int {
	count := 0
	snapshot, err := windows.CreateToolhelp32Snapshot(windows.TH32CS_SNAPPROCESS, 0)
	if err != nil {
		fmt.Printf("CreateToolhelp32Snapshot failed: %v\n", err)
		return count
	}
	defer windows.CloseHandle(snapshot)
	var processEntry windows.ProcessEntry32
	processEntry.Size = uint32(unsafe.Sizeof(processEntry))
	for err := windows.Process32First(snapshot, &processEntry); err == nil; err = windows.Process32Next(snapshot, &processEntry) {
		if windows.UTF16ToString(processEntry.ExeFile[:]) == exeName {
			count++
		}
	}
	return count
}

// KillProcessByName closes a process by its name
func KillProcessByName(processName string) {
	cmd := exec.Command("taskkill", "-f", "-t", "-im", processName)
	_ = cmd.Run()
}
