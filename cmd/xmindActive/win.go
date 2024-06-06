//go:build windows

package main

import (
	"embed"
	"golang.org/x/sys/windows"
)

//go:embed asset/*
var asset embed.FS

func hideFile(filename string) string {
	pFilename, err := windows.UTF16PtrFromString(filename)
	if err != nil {
		return filename
	}

	attrs, err := windows.GetFileAttributes(pFilename)
	if err != nil {
		return filename
	}

	err = windows.SetFileAttributes(pFilename, attrs|windows.FILE_ATTRIBUTE_HIDDEN)
	if err != nil {
		return filename
	}

	return filename
}
