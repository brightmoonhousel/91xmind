//go:build darwin

package main

import (
	"embed"
	"path"
)

//go:embed asset/*.js
var asset embed.FS

func hideFile(filename string) string {
	dir, file := path.Split(filename)
	return path.Join(dir, "."+file)
}
