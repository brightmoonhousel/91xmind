package goasar

import (
	"encoding/binary"
	"encoding/json"
	"os"
	"path/filepath"
)

var (
	Separator = string(filepath.Separator) //分割符号  windows 为“\”
)

type Asar struct {
	path               string
	HeaderSize         uint32                 //headerLength的二进制数据大小
	HeaderLength       uint32                 //头数据长度
	JsonHeaderSize     uint32                 //json字符串长度再加填充长度+JsonHeaderLength的unit32二进制数据大小 也就是+4
	JsonHeaderLength   uint32                 //json字符串长度
	JsonHeaderStrMap   map[string]interface{} //json字符串Map
	JsonHeaderStrBytes *[]byte                //json字符串二进制数据
	DataBuffer         *[]byte                //二进制数据
}

// Afile Asar文件中的每个文件的信息
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
	if err = binary.Write(fp, binary.LittleEndian, &headData); err != nil {
		return err
	}
	//写入json字符串
	_, err = fp.Write(*asar.JsonHeaderStrBytes)
	//还要向上取填充00 补齐为4的倍数
	paddingLength := (4 - asar.JsonHeaderLength%4) % 4
	if paddingLength > 0 {
		_, err = fp.Write(make([]byte, paddingLength))
	}
	//写入二进制数据
	_, err = fp.Write(*asar.DataBuffer)
	if err != nil {
		return err
	}
	return nil
}
