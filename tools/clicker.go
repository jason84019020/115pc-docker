package main

import (
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net"
    "net/http"
    "time"
    "github.com/chromedp/chromedp"
)

const (
    targetURL        = "chrome://transfer-frame/"
    browserDebugPort = 9222
    maxWaitTime      = 30 * time.Second
    retryInterval    = 500 * time.Millisecond
)

func main() {
    fmt.Println("[*] 嘗試連接 Chrome remote debugging...")

    // 1️⃣ 等待端口
    if err := waitPort("127.0.0.1", browserDebugPort, maxWaitTime); err != nil {
        fmt.Println(err)
        return
    }
    fmt.Printf("[✓] 端口 %d 已啟動\n", browserDebugPort)

    // 2️⃣ 取得 WebSocket URL
    wsURL, err := waitWebSocketURL(maxWaitTime)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println("[✓] WebSocket URL:", wsURL)

    // 3️⃣ 建立 chromedp context
    allocCtx, allocCancel := chromedp.NewRemoteAllocator(context.Background(), wsURL)
    defer allocCancel()

    ctx, ctxCancel := chromedp.NewContext(allocCtx)
    defer ctxCancel()

    ctx, timeoutCancel := context.WithTimeout(ctx, 20*time.Second)
    defer timeoutCancel()

    // 4️⃣ 執行任務
    fmt.Println("[*] 開始導航到:", targetURL)
    tasks := chromedp.Tasks{
        chromedp.Navigate(targetURL),
        chromedp.WaitVisible(`#js-start_all_download`, chromedp.ByID),
        chromedp.Click(`#js-start_all_download`, chromedp.ByID),
    }

    fmt.Println("[*] 開始執行任務...")
    if err := chromedp.Run(ctx, tasks); err != nil {
        fmt.Printf("[x] 操作失敗: %v\n", err)
        return
    }

    fmt.Println("[✓] 按鈕已成功觸發！")
}

// waitPort 持續嘗試 TCP 連線，最多等待 timeout
func waitPort(host string, port int, timeout time.Duration) error {
    deadline := time.Now().Add(timeout)
    addr := fmt.Sprintf("%s:%d", host, port)
    attempt := 0

    for time.Now().Before(deadline) {
        attempt++
        conn, err := net.DialTimeout("tcp", addr, 1*time.Second)
        if err == nil {
            conn.Close()
            fmt.Printf("[✓] 第 %d 次嘗試: 連線成功\n", attempt)
            return nil
        }
        fmt.Printf("[*] 第 %d 次嘗試: 連線失敗 (%v)\n", attempt, err)
        time.Sleep(retryInterval)
    }
    return fmt.Errorf("[x] 等待端口 %s 超時", addr)
}

// waitWebSocketURL 持續嘗試取得 WebSocket URL，最多等待 timeout
func waitWebSocketURL(timeout time.Duration) (string, error) {
    deadline := time.Now().Add(timeout)
    url := fmt.Sprintf("http://127.0.0.1:%d/json/version", browserDebugPort)
    attempt := 0

    for time.Now().Before(deadline) {
        attempt++
        resp, err := http.Get(url)
        if err == nil {
            body, err := io.ReadAll(resp.Body)
            resp.Body.Close()
            if err == nil {
                var v struct {
                    WebSocketDebuggerUrl string `json:"webSocketDebuggerUrl"`
                }
                if err := json.Unmarshal(body, &v); err == nil && v.WebSocketDebuggerUrl != "" {
                    fmt.Printf("[✓] 第 %d 次嘗試: WebSocket URL 已取得\n", attempt)
                    return v.WebSocketDebuggerUrl, nil
                }
            }
        }
        fmt.Printf("[*] 第 %d 次嘗試: WebSocket 尚未就緒 (%v)\n", attempt, err)
        time.Sleep(retryInterval)
    }

    return "", fmt.Errorf("[x] 等待 WebSocket URL 超時")
}
