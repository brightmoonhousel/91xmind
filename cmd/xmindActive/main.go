//go:generate goversioninfo -icon=../res/icon.ico -manifest=../res/go.exe.manifest
package main

import (
	"fmt"
	"github.com/fogleman/ease"
	"math"
	"math/rand"
	"strconv"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/lucasb-eyer/go-colorful"
)

// 禁止
const (
	progressBarWidth  = 71
	progressFullChar  = "#"
	progressEmptyChar = "-"
	dotChar           = " - "
)
const (
	p1 = iota
	p2
	p3
)

// 用于设置视图样式的一般内容
var (
	keywordStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("211"))
	subtleStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("241"))
	ticksStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("79"))
	failedStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("#FF0000"))
	succeedStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("#00FF00"))
	checkboxStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("212"))
	progressEmpty = subtleStyle.Render(progressEmptyChar)
	dotStyle      = lipgloss.NewStyle().Foreground(lipgloss.Color("236")).Render(dotChar)
	mainStyle     = lipgloss.NewStyle().MarginLeft(2)
	// 我们将用于进度条的渐变颜色
	ramp = makeRampStyles("#B14FFF", "#00FFA3", progressBarWidth)
	p    *tea.Program
	Rand = rand.New(rand.NewSource(time.Now().UnixNano()))
)

type (
	tickMsg     struct{}
	frameMsg    struct{}
	changeState struct{}
	failedMsg   struct {
		msg string
	}
	launchMsg struct{}
)

type model struct {
	Choice    int
	Chosen    bool
	Ticks     int
	Frames    int
	Progress  float64
	Loaded    bool
	Failed    bool
	failedMsg string
	Quitting  bool
	state     int
}

func main() {
	initialModel := model{
		0,
		false,
		3,
		0,
		0,
		false,
		false,
		"",
		false,
		0,
	}
	p = tea.NewProgram(initialModel)

	if _, err := p.Run(); err != nil {
		fmt.Println("could not start program:", err)
	}
}

func Launch() tea.Msg {
	return launchMsg{}
}

func tick() tea.Cmd {
	return tea.Tick(time.Second, func(time.Time) tea.Msg {
		return tickMsg{}
	})
}

func frame() tea.Cmd {
	return tea.Tick(time.Second/60, func(time.Time) tea.Msg {
		return frameMsg{}
	})
}

func (m model) Init() tea.Cmd {
	return nil
}

// Update Main-update
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	// 确保这些键始终退出
	if msg, ok := msg.(tea.KeyMsg); ok {
		k := msg.String()
		if k == "q" || k == "esc" || k == "ctrl+c" {
			m.Quitting = true
			return m, tea.Quit
		}
	}
	switch msg.(type) {
	case launchMsg:
		go rebootApp(xmindExe)
	}
	// 将消息和模型移交给相应的更新函数
	// 基于当前状态的适当视图。
	if !m.Chosen {
		return updateChoices(msg, m)
	}
	return updateChosen(msg, m)
}

// View Main-View
func (m model) View() string {
	var s string
	if m.Quitting {
		return "\n  See you later!\n\n"
	}
	if !m.Chosen {
		s = choicesView(m)
	} else {
		s = chosenView(m)
	}
	return mainStyle.Render("\n" + s + "\n\n")
}

// Sub-update functions
func updateChoices(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "down":
			m.Choice++
			if m.Choice > 1 {
				m.Choice = 1
			}
		case "up":
			m.Choice--
			if m.Choice < 0 {
				m.Choice = 0
			}
		case "enter":
			m.Chosen = true
			if m.Choice == 0 {
				go func() {
					err := checkEnv()
					if err != nil {
						time.Sleep(time.Second * 1)
						p.Send(failedMsg{err.Error()})
						return
					} else {
						p.Send(changeState{})
					}
					err = start()
					if err != nil {
						time.Sleep(time.Second * 1)
						p.Send(failedMsg{err.Error()})
						return
					} else {
						p.Send(changeState{})
					}
				}()
			} else if m.Choice == 1 {
				go func() {
					err := checkEnv()
					if err != nil {
						time.Sleep(time.Second * 1)
						p.Send(failedMsg{err.Error()})
						return
					} else {
						p.Send(changeState{})
					}
					err = restore()
					if err != nil {
						time.Sleep(time.Second * 1)
						p.Send(failedMsg{err.Error()})
						return
					} else {
						p.Send(changeState{})
					}
				}()
			}

			return m, frame()
		}
	}

	return m, nil
}
func updateChosen(msg tea.Msg, m model) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case changeState:
		m.state++
	case failedMsg:
		m.Failed = true
		m.failedMsg = msg.msg
		return m, tick()
	case frameMsg:
		if !m.Loaded && !m.Failed {
			if m.Progress < (0.1+Rand.Float64()*(0.2)) && m.state == p1 {
				m.Frames++
				m.Progress = ease.Linear(float64(m.Frames) / float64(100))
			} else if m.Progress < (0.3+Rand.Float64()*(0.5)) && m.state == p2 {
				m.Frames++
				m.Progress = ease.Linear(float64(m.Frames) / float64(100))
			} else if m.Progress < 1 && m.state == p3 {
				m.Frames++
				m.Progress = ease.Linear(float64(m.Frames) / float64(100))
			} else if m.Progress >= 1 {
				m.Progress = 1
				m.Loaded = true
				m.Ticks = 3
				return m, tick()
			}
			return m, frame()
		}

	case tickMsg:
		if m.Loaded || m.Failed {
			if m.Ticks == 0 {
				if !m.Failed {
					m = model{0, false, 3, 0, 0, false, false, "", false, 0}
					return m, Launch
				}
				m = model{0, false, 3, 0, 0, false, false, "", false, 0}
				return m, nil
			}
			m.Ticks--
			return m, tick()
		}
	}
	return m, nil
}

// Sub-views
func choicesView(m model) string {
	c := m.Choice
	tpl := "What you want to do ?   " + failedStyle.Render("操作前请先保存未完成的项目!!!") + "\n\n"
	tpl += "%s\n\n"
	tpl += "\n\n"
	tpl += subtleStyle.Render("↑/↓: 方向键上下选择") + dotStyle +
		subtleStyle.Render("Enter: 回车键确定") + dotStyle +
		subtleStyle.Render("Esc : 退出")

	choices := fmt.Sprintf(
		"%s\n\n%s",
		checkbox("1.Change the activation server", c == 0),
		checkbox("2.Restore the activation server", c == 1),
	)

	return fmt.Sprintf(tpl, choices)
}
func chosenView(m model) string {
	var msg string
	switch m.Choice {
	case 0:
		msg = fmt.Sprintf("%s", keywordStyle.Render("正在改变激活服务器..."))
	case 1:
		msg = fmt.Sprintf("%s", keywordStyle.Render("正在无痕恢复中..."))
	}
	label := "Please wait..."
	if m.Loaded { //3秒后返回
		label = fmt.Sprintf("%s\n\nXmind will restart after %s seconds", succeedStyle.Render("Success!"), ticksStyle.Render(strconv.Itoa(m.Ticks)))
	} else if m.Failed { //3秒后返回
		label = fmt.Sprintf("%s\n\nReturn after %s seconds...", failedStyle.Render("Error!", m.failedMsg), ticksStyle.Render(strconv.Itoa(m.Ticks)))
	}

	return msg + "\n\n" + label + "\n" + progressbar(m.Progress) + "%"
}

// 绘制选择器和进度条
func checkbox(label string, checked bool) string {
	if checked {
		return checkboxStyle.Render("-> " + label)
	}
	return fmt.Sprintf("   %s", label)
}
func progressbar(percent float64) string {
	w := float64(progressBarWidth)

	fullSize := int(math.Round(w * percent))
	var fullCells string
	for i := 0; i < fullSize; i++ {
		fullCells += ramp[i].Render(progressFullChar)
	}
	emptySize := int(w) - fullSize
	emptyCells := strings.Repeat(progressEmpty, emptySize)

	return fmt.Sprintf("[%s%s] %3.0f", fullCells, emptyCells, math.Round(percent*100))
}

// Utils
func makeRampStyles(colorA, colorB string, steps float64) (s []lipgloss.Style) {
	cA, _ := colorful.Hex(colorA)
	cB, _ := colorful.Hex(colorB)

	for i := 0.0; i < steps; i++ {
		c := cA.BlendLuv(cB, i/steps)
		s = append(s, lipgloss.NewStyle().Foreground(lipgloss.Color(colorToHex(c))))
	}
	return
}
func colorToHex(c colorful.Color) string {
	return fmt.Sprintf("#%s%s%s", colorFloatToHex(c.R), colorFloatToHex(c.G), colorFloatToHex(c.B))
}
func colorFloatToHex(f float64) (s string) {
	s = strconv.FormatInt(int64(f*255), 16)
	if len(s) == 1 {
		s = "0" + s
	}
	return
}
