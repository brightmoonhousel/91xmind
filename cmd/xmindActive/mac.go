//go:build darwin

package main

import (
	"embed"
	"os"
)

//go:embed asset/*.js
var asset embed.FS

func hideFile(filename string) error {
	err := os.Rename(filename, "."+filename)
	if err != nil {
		return err
	}
	return nil
}
