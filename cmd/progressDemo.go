package main

import (
	"os"
	"regexp"
)

func FixDialogGiftCard(jsCode string) string {
	card, _ := os.ReadFile("C:\\Users\\chiro\\GolandProjects\\xmindActive\\cmd\\hookFilePatch\\asset\\dialog-gift-card.fix.js")
	re := regexp.MustCompile(`handleRedeem\.*:`)
	// 使用 ReplaceAllString 进行替换
	updatedJSCode := re.ReplaceAllString(jsCode, `handleRedeem:hook,abc:`)
	fixStr := string(card) + updatedJSCode
	return fixStr
}

func main() {
	jsCode, _ := os.ReadFile("C:\\Users\\chiro\\Desktop\\dialog-gift-card.js")
	fixedCode := FixDialogGiftCard(string(jsCode))
	os.WriteFile("C:\\Users\\chiro\\Desktop\\dialog-gift-card.fixed.js", []byte(fixedCode), 0644)
}
