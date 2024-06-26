//go:build darwin

package hookFilePatch

import (
	"errors"
)

func checkEnv() error {
	// 检查Xmind是否存在
	if !hookFilePatch.FileExists(hookFilePatch.AsarFile) {
		return errors.New("xmind is not installed")
	}
	//杀死进程
	hookFilePatch.KillProcessByName("Xmind")
	return nil
}
