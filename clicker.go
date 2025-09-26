package main

import (
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"

    "github.com/chromedp/chromedp"
)

const (
    targetURL        = "chrome://transfer-frame/"
    browserDebugPort = 9222
)

func main() {
    // 1. 取得 WebSocket URL
    wsURL, err := func() (string, error) {
        resp, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d/json/version", browserDebugPort))
        if err != nil {
            return "", err
        }
        defer resp.Body.Close()

        b, _ := io.ReadAll(resp.Body)
        var v struct {
            WebSocketDebuggerUrl string `json:"webSocketDebuggerUrl"`
        }
        if err := json.Unmarshal(b, &v); err != nil {
            return "", err
        }
        return v.WebSocketDebuggerUrl, nil
    }()
    if err != nil || wsURL == "" {
        fmt.Println("取得 WebSocket 失敗:", err)
        return
    }

    // 2. 建立 chromedp context
    allocCtx, allocCancel := chromedp.NewRemoteAllocator(context.Background(), wsURL)
    defer allocCancel()

    ctx, ctxCancel := chromedp.NewContext(allocCtx)
    defer ctxCancel()

    ctx, timeoutCancel := context.WithTimeout(ctx, 20*time.Second)
    defer timeoutCancel()

    // 3. 執行操作
    tasks := chromedp.Tasks{
        chromedp.Navigate(targetURL),
        chromedp.WaitVisible(`#js-start_all_download`, chromedp.ByID),
        chromedp.Click(`#js-start_all_download`, chromedp.ByID),
    }

    if err := chromedp.Run(ctx, tasks); err != nil {
        fmt.Println("操作失敗:", err)
        return
    }

    fmt.Println("按鈕已成功觸發！")
}
