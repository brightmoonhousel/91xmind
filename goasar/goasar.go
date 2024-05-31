package goasar

import (
	"encoding/binary"
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
)

var (
	Separator = string(filepath.Separator) //分割符号  windows 为“\”
)

type Asar struct {
	path               string
	HeaderSize         uint32                 //headerLength的二进制数据大小
	HeaderLength       uint32                 //头数据长度
	JsonHeaderSize     uint32                 //json字符串长度+JsonHeaderLength unit32二进制数据大小
	JsonHeaderLength   uint32                 //json字符串长度
	JsonHeaderStrMap   map[string]interface{} //json字符串Map
	JsonHeaderStrBytes *[]byte                //json字符串二进制数据
	DataBuffer         *[]byte                //二进制数据
}

// Afile 文件中的文件信息
type Afile struct {
	Offset     string
	Size       float64
	Unpacked   bool
	Path       string
	IsDir      bool
	DataBuffer *[]byte
}

func NewAsarFile(path string) *Asar {
	return &Asar{path: path}
}

func (asar *Asar) Open() error {
	fp, err := os.Open(asar.path)
	if err != nil {
		return err
	}
	defer fp.Close()
	headData := make([]uint32, 4)
	if err := binary.Read(fp, binary.LittleEndian, &headData); err != nil {
		return err
	}
	// 解析头数据
	asar.HeaderSize = headData[0]
	asar.HeaderLength = headData[1]
	asar.JsonHeaderSize = headData[2]
	asar.JsonHeaderLength = headData[3]

	jsonHeaderStrBytes := make([]byte, asar.JsonHeaderLength)
	//  uint32Size := int(unsafe.Sizeof(uint32(0)))
	//	offset := int64(4 * uint32Size)
	//	这里偏移为4个uint32数据的大小，16字节
	if _, err := fp.ReadAt(jsonHeaderStrBytes, 16); err != nil {
		return err
	}
	asar.JsonHeaderStrBytes = &jsonHeaderStrBytes
	if err := json.Unmarshal(jsonHeaderStrBytes, &asar.JsonHeaderStrMap); err != nil {
		return err
	}

	//(16+asar.jsonHeaderLength+3) &^ 3
	baseOffset := (int64)(asar.HeaderLength + 8)
	// 获取文件大小
	fileInfo, err := fp.Stat()
	if err != nil {
		return err
	}
	fileSize := fileInfo.Size()
	if baseOffset > fileSize {
		return err
	}
	// 计算剩余内容的大小
	remainingSize := fileSize - baseOffset
	// 创建缓冲区
	buffer := make([]byte, remainingSize)
	// 从指定位置开始读取剩余内容到缓冲区中
	_, err = fp.ReadAt(buffer, baseOffset)
	if err != nil {
		return err
	}
	asar.DataBuffer = &buffer
	return nil
}
func (asar *Asar) Save() error {
	// 创建一个新的文件
	fp, err := os.Create(asar.path)
	defer fp.Close()
	if err != nil {
		return err
	}
	headData := make([]uint32, 4)
	headData[0] = asar.HeaderSize
	headData[1] = asar.HeaderLength
	headData[2] = asar.JsonHeaderSize
	headData[3] = asar.JsonHeaderLength
	//写入头文件
	if err := binary.Write(fp, binary.LittleEndian, &headData); err != nil {
		return err
	}
	//写入json字符串
	fp.Write(*asar.JsonHeaderStrBytes)
	//还要向上取填充00 补齐为4的倍数
	paddingLength := (4 - asar.JsonHeaderLength%4) % 4
	if paddingLength > 0 {
		fp.Write(make([]byte, paddingLength))
	}
	//写入二进制数据
	fp.Write(*asar.DataBuffer)
	return nil
}

//func (asar *Asar) ListAsarFiles() {
//
//	var aFiles []Afile
//	readAsarFilesInfo(asar.header["files"].(map[string]interface{}), "", &aFiles)
//	for i := range aFiles {
//		fmt.Println(aFiles[i].Path)
//	}
//}

//	func ExtractAsar(asarPath string, prePath string) error {
//		asar, _ := OpenAsar(asarPath)
//		defer asar.Close()
//		var aFiles []Afile
//		readAsarFilesInfo(asar.header["files"].(map[string]interface{}), "", &aFiles)
//		// 创建一个有固定容量的WaitGroup，用于等待所有goroutine完成
//		var wg sync.WaitGroup
//		wg.Add(len(aFiles))
//		// 限制并发数
//		sem := make(chan struct{}, 10)
//		for _, a := range aFiles {
//			if a.Unpacked {
//				continue
//			}
//			// 在允许的并发数范围内启动goroutine
//			sem <- struct{}{}
//			go func(a Afile) {
//				defer func() {
//					wg.Done()
//					<-sem // 释放一个并发数
//				}()
//				err := createFile(a, prePath, asar)
//				if err != nil {
//					fmt.Println(err)
//				}
//			}(a)
//		}
//		wg.Wait()
//		return nil
//	}
//
//	func createFile(a Afile, prePath string, asar *Asar) error {
//		size := int(a.Size)
//		offset, _ := strconv.Atoi(a.Offset)
//
//		fp := filepath.Join(prePath, a.Path)
//		/**
//		Split: "/ home/ arnie/ amelia. jpg"
//		dir: "/ home/ arnie/"
//		file: "amelia. jpg"
//		*/
//		dir, _ := filepath.Split(fp)
//		//creat dir
//		mu.Lock()
//		defer mu.Unlock()
//		err := os.MkdirAll(dir, os.ModePerm)
//		//creat file
//		file, err := os.Create(fp)
//		if err != nil {
//			fmt.Printf("无法创建目标文件: %v\n", err)
//			return err
//		}
//		defer file.Close()
//
//		// Moves the file pointer to the  offset location
//		_, err = asar.fp.Seek(int64(asar.baseOffset+offset), io.SeekStart)
//		if err != nil {
//			fmt.Printf("无法移动文件指针: %v\n", err)
//			return err
//		}
//		// read The Data And Write To The TargetFile
//		data := make([]byte, size)
//		_, err = io.ReadFull(asar.fp, data)
//		if err != nil {
//			fmt.Printf("无法读取数据: %v\n", err)
//			fmt.Println(a)
//			return err
//		}
//		_, err = file.Write(data)
//		if err != nil {
//			fmt.Printf("无法写入目标文件: %v\n", err)
//			return err
//		}
//		return nil
//	}

func (asar *Asar) CreateFileSys() (*SimpleFileSystem, error) {
	aFileSystem := NewSimpleFileSystem()
	type fileStackItem struct {
		fullPath string
		fileList map[string]interface{}
	}
	strMap := asar.JsonHeaderStrMap["files"].(map[string]interface{})
	stack := []fileStackItem{{"", strMap}} // 初始化栈
	for len(stack) > 0 {
		// 弹出栈顶元素
		current := stack[len(stack)-1] // 获取栈顶元素
		stack = stack[:len(stack)-1]   // 弹出
		// 遍历当前目录中的文件和子目录
		for name, info := range current.fileList {
			// 将文件名与前缀拼接成完整路径
			fullPath := filepath.Join(current.fullPath, name)
			if subFiles, ok := info.(map[string]interface{}); ok && subFiles["files"] != nil {
				//包含"files"键，则认为是目录,将目录压栈
				stack = append(stack, fileStackItem{fullPath, subFiles["files"].(map[string]interface{})})
			} else if file, ok := info.(map[string]interface{}); ok {
				// 是文件
				size, sizeOk := file["size"].(float64)
				unpacked, unpackedOk := file["unpacked"].(bool)
				offset, offsetOk := file["offset"].(string)
				if sizeOk && offsetOk && !unpacked {
					f := Afile{
						Offset:   offset,
						Size:     size,
						Unpacked: false,
						Path:     fullPath,
						IsDir:    false,
					}

					of, _ := strconv.Atoi(f.Offset)
					si := (int)(f.Size)
					subData := (*asar.DataBuffer)[of : of+si]
					copiedData := make([]byte, len(subData))
					copy(copiedData, subData)
					f.DataBuffer = &copiedData
					aFileSystem.CreateFile(&f)
				} else if unpackedOk && unpacked {
					f := Afile{
						Offset:   "0",
						Size:     size,
						Unpacked: true,
						Path:     fullPath,
						IsDir:    false,
					}
					aFileSystem.CreateFile(&f)
				} else {
					//[鹿鱼][2024/5/28]TODO:空文件夹
				}
			}

		}

	}
	//asar.DataBuffer = nil
	//runtime.GC()
	return aFileSystem, nil
}

func roundup(x, y uint32) uint32 {
	return (x + y - 1) & ^(y - 1)
}
