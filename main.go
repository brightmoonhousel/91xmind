package main

import (
	"bytes"
	"fmt"
	"github.com/bodgit/sevenzip"
	"io"
	"os"
)

type seekReaderAt interface {
	io.ReaderAt
	io.Seeker
}

func streamSizeBySeeking(s io.Seeker) (int64, error) {
	currentPosition, err := s.Seek(0, io.SeekCurrent)
	if err != nil {
		return 0, fmt.Errorf("getting current offset: %w", err)
	}
	maxPosition, err := s.Seek(0, io.SeekEnd)
	if err != nil {
		return 0, fmt.Errorf("fast-forwarding to end: %w", err)
	}
	_, err = s.Seek(currentPosition, io.SeekStart)
	if err != nil {
		return 0, fmt.Errorf("returning to prior offset %d: %w", currentPosition, err)
	}
	return maxPosition, nil
}

func main() {

	// 读取 exe 文件内容
	exeContent, err := os.ReadFile("C:\\Users\\chiro\\Downloads\\Programs\\Xmind-for-Windows-x64bit-24.04.10311-202405232355.exe")
	if err != nil {
		panic(err)
	}

	// 查找 7z 头部的二进制特征
	header := []byte{0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C}
	startIndex := bytes.Index(exeContent, header)
	if startIndex == -1 {
		fmt.Println("7z header not found in exe file")
		return
	}

	// 截取从头部特征位置到文件末尾的部分
	sevenZipContent := exeContent[startIndex:]

	// 使用 bytes.NewReader() 创建一个实现了 io.ReaderAt 和 io.Seeker 接口的对象
	reader := bytes.NewReader(sevenZipContent)

	extractArchive(reader)
}
func extractFile(f *sevenzip.File) error {
	rc, err := f.Open()
	if err != nil {
		return err
	}
	defer rc.Close()
	rc.Read(make([]byte, 0))
	return nil
}

func extractArchive(sourceArchive io.Reader) error {
	sra, ok := sourceArchive.(seekReaderAt)
	if !ok {
		return fmt.Errorf("input type must be an io.ReaderAt and io.Seeker because of zip format constraints")
	}

	size, err := streamSizeBySeeking(sra)
	if err != nil {
		return fmt.Errorf("determining stream size: %w", err)
	}

	r, err := sevenzip.NewReaderWithPassword(sra, size, "")
	if err != nil {
		return err
	}
	for _, f := range r.File {
		if err = extractFile(f); err != nil {
			return err
		}
	}
	return nil
}
