//go:generate goversioninfo -icon=../res/icon.ico -manifest=../res/go.exe.manifest

package main

import (
	"crypto/md5"
	"embed"
	_ "embed"
	"encoding/hex"
	"fmt"
	"golang.org/x/sys/windows"
	"gopkg.in/yaml.v3"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
	"time"
	"unsafe"
	"xmindActive/cmd/xmindFix"
)

const (
	getUpdateUrl = "https://xmind.cn/xmind/update/latest-win64.yml" // 获取更新exe下载链接的链接
	exeName      = "Xmind.exe"
	maxRetries   = 10
)

var (
	xmindDir            string                 // xmind路径
	xmindExe            string                 // xmind.exe路径
	sevenZip            string                 // 7zr.exe文件目录
	xmindUpdateFileName string                 // 更新exe文件名
	updateYml           map[string]interface{} // 更新信息
	isReboot            = false                // 是否需要重启
)

//go:embed asset/*.exe
var asset embed.FS

func init() {
	//大于一个更新程序直接退出
	checkSelfRunning()
	// 获取当前用户的本地应用数据目录
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		return
	}
	// C:\Users\chiro\AppData\Local\Programs\Xmind\Xmind.exe
	xmindDir = filepath.Join(localAppData, "Programs", "Xmind")
	//如果xmindDir不存在，退出
	if _, err := os.Stat(xmindDir); os.IsNotExist(err) {
		return
	}
	// C:\Users\chiro\AppData\Local\Programs\Xmind\Xmind.exe
	xmindExe = filepath.Join(localAppData, "Programs", "Xmind", "Xmind.exe")
	//  C:\Users\chiro\AppData\Local\Programs\Xmind\7zr.exe
	sevenZip = filepath.Join(xmindDir, "7zr.exe")
	//  C:\Users\chiro\AppData\Local\Programs\Xmind\latest.exe
	xmindUpdateFileName = filepath.Join(xmindDir, "latest.exe")
}

func main() {
	isDownload := false
	//获取命令行参数
	if len(os.Args) == 1 || len(os.Args) > 2 {
		return
	}
	if os.Args[1] == "-d" {
		isDownload = true
	} else if os.Args[1] == "-i" {
		isDownload = false
	} else {
		os.Exit(0)
	}
	//获取下载链接
	fmt.Println("获取更新信息")
	err := getUpdateInfo()
	if isDownload {
		if err != nil {
			return
		}
		//判断更新程序是否存在
		if needDownload() {
			fmt.Println("开始下载更新包")
			err = downloadFile(updateYml["url"].(string), xmindUpdateFileName)
			if err != nil {
				return
			}
		} else {
			fmt.Println("更新包已存在,无需下载")
		}
		// 释放解压程序
		fmt.Println("释放解压程序")
		err = freed7z()
		if err != nil {
			return
		}
		os.Exit(0)
	}
	if needDownload() {
		fmt.Println("文件不完整")
		os.Exit(0)
	}

	//先检测xmind是否打开状态
	for {
		if !isProcessRunning(exeName) {
			break
		}
		fmt.Println("xmind正在运行，等待关闭")
		time.Sleep(3 * time.Second)
	}
	//启动线程关闭xmind，提示正在更新
	fmt.Println("启动线程轮询关闭xmind，提示正在更新")
	fuckDone := make(chan bool) // 创建一个通道用于通知子线程关闭
	go fuckExe(exeName, fuckDone)
	//尝试次数
	retries := 0
	for {
		fmt.Println("开始解压")
		cmd := exec.Command(sevenZip, "x", xmindUpdateFileName, "-o"+xmindDir, "-aoa")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		err := cmd.Run()
		if err != nil {
			fmt.Printf("解压失败: %v\n", err)
			retries++
			if retries >= maxRetries {
				fmt.Println("达到最大重试次数，退出")
				return
			}
			fmt.Println("重新尝试解压...")
			time.Sleep(3 * time.Second) // 等待一段时间再重试
			continue
		}
		fmt.Println("覆盖完成，开始patch")
		err = xmindFix.UpdatePatch()
		if err != nil {
			fmt.Printf("更新失败: %v\n", err)
			retries++
			if retries >= maxRetries {
				fmt.Println("达到最大重试次数，退出")
				return
			}
			fmt.Println("重新尝试解压...")
			time.Sleep(2 * time.Second) // 等待一段时间再重试
			continue
		}
		break // 成功更新，退出循环
	}
	fmt.Println("更新完毕，关闭检测线程")
	fuckDone <- true
	fmt.Println("删除垃圾文件")
	// 删除更新缓存
	err = os.Remove(xmindUpdateFileName)
	if err != nil {
		return
	}
	err = os.Remove(sevenZip)
	if err != nil {
		return
	}
	if isReboot {
		cmd := exec.Command(xmindExe)
		_ = cmd.Run()
	}
}

func freed7z() error {
	out7z, err := os.Create(sevenZip)
	defer out7z.Close()
	if err != nil {
		return err
	}
	readFile, _ := asset.ReadFile("asset/7zr.exe")
	_, err = out7z.Write(readFile)
	if err != nil {
		return err
	}
	return nil
}

func getUpdateInfo() error {
	resp, err := http.Get(getUpdateUrl)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return err
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	err = yaml.Unmarshal(body, &updateYml)
	if err != nil {
		return err
	}
	return nil
}

// 检查更新程序(自己)是否在运行,避免重复运行
func checkSelfRunning() {
	fullPath := os.Args[0]
	selfName := filepath.Base(fullPath)
	count := countProcessRunning(selfName)
	if count > 1 {
		os.Exit(0)
	}
}

// 轮询检查待更新程序是否运行,避免影响更新
func fuckExe(exeName string, fuckDone chan bool) {
	for {
		select {
		case <-fuckDone:
			return
		default:
			isRunning := isProcessRunning(exeName)
			fmt.Println(exeName+"当前是否运行:", isRunning)
			time.Sleep(time.Second)
			if isRunning {
				killProcessByName(exeName)
				cmd := exec.Command("msg", "*", exeName+"正在更新，稍后自动开启")
				_ = cmd.Run()
				isReboot = true
			}
		}
	}
}

// 判断是否需要下载
func needDownload() bool {
	if _, err := os.Stat(xmindUpdateFileName); err == nil {
		//校验MD5判断文件是否下载完整
		if fileMd5, err := getMD5(xmindUpdateFileName); err == nil {
			if fileMd5 == updateYml["md5"].(string) {
				return false
			}
		}
	}
	return true
}

// --util--
// 检查进程是否运行
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

// 检查进程数量
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

// 杀死进程
func killProcessByName(processName string) {
	cmd := exec.Command("taskkill", "-f", "-t", "-im", processName)
	_ = cmd.Run()
}

// md5校验文件完整性
func getMD5(name string) (string, error) {
	// 打开文件
	file, err := os.Open(name)
	if err != nil {
		return "", err
	}
	defer file.Close()
	// 创建 MD5 哈希计算器
	hash := md5.New()
	// 将文件内容写入哈希计算器
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	// 获取哈希值
	hashInBytes := hash.Sum(nil)[:16]
	hashInString := hex.EncodeToString(hashInBytes)
	return hashInString, nil
}

// 文件下下载
func downloadFile(url string, filename string) error {
	dir := filepath.Dir(filename)
	// 创建目标目录（如果不存在）
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create directory: %v", err)
	}
	// 创建文件
	out, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("failed to create file: %v", err)
	}
	defer out.Close()
	// 发送HTTP GET请求
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download file: %v", err)
	}
	defer resp.Body.Close()
	// 检查HTTP响应状态码
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}
	// 将响应主体复制到文件
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to write to file: %v", err)
	}
	return nil
}
