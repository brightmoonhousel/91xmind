package main

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"xmindActive/cmd/goasar"
)

func main() {
	inputDir := "C:\\Users\\chiro\\GolandProjects\\xmindActive\\cmd\\xmindActive\\asset"
	outputDir := "C:\\Users\\chiro\\GolandProjects\\xmindActive\\cmd\\xmindActive\\asset_enc"

	err := filepath.Walk(inputDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			compressed, err := compressFile(path)
			if err != nil {
				return err
			}
			outputPath := filepath.Join(outputDir, info.Name()+".gz")
			err = os.WriteFile(outputPath, compressed, 0644)
			if err != nil {
				return err
			}
			fmt.Printf("Compressed %s to %s\n", path, outputPath)
		}
		return nil
	})

	if err != nil {
		fmt.Println("Error:", err)
	}
}
func Extract() {
	// 检查是否有命令行参数传入
	if len(os.Args) < 2 {
		return
	}

	// 获取第一个命令行参数，即拖动到可执行文件的文件路径
	fPath := os.Args[1]
	if _, err := os.Stat(fPath); err != nil {
		return
	}

	//初始化文件信息
	appAsar := goasar.NewAsarFile(fPath)
	//读取到内存
	err := appAsar.Open()
	if err != nil {
		return
	}

	asarSys, err := goasar.NewSimpleFileSystemByAsar(appAsar)
	if asarSys == nil {
		return
	}

	dirPath := filepath.Join(filepath.Dir(fPath), "app")
	err = asarSys.Extract(dirPath)
	if err != nil {
		return
	}
}

func compressFile(filename string) ([]byte, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	if _, err := gz.Write(content); err != nil {
		return nil, err
	}
	if err := gz.Close(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func decompressFile(compressed []byte) ([]byte, error) {
	r, err := gzip.NewReader(bytes.NewBuffer(compressed))
	if err != nil {
		return nil, err
	}
	defer r.Close()

	return io.ReadAll(r)
}
