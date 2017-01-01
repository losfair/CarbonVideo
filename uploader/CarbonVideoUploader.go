package main

import (
    "os"
    "log"
    "fmt"
    "bufio"
    "strings"
    "qiniupkg.com/api.v7/kodocli"
)

type PutRet struct {
    Hash    string `json:"hash"`
    Key     string `json:"key"`
    Filesize int `json:"filesize"`
}

func main() {
    /*
        Parameters:
            1: File path
    */
    if len(os.Args) != 2 {
        log.Fatal("Usage: CarbonVideoUploader [File path]")
    }

    filePath := os.Args[1]

    reader := bufio.NewReader(os.Stdin)
    fmt.Print("Key: ")
    key, err := reader.ReadString('\n')
    if err != nil {
        panic(err)
    }
    fmt.Print("Token: ")
    token, err := reader.ReadString('\n')
    if err != nil {
        panic(err)
    }

    key = strings.TrimSpace(key)
    token = strings.TrimSpace(token)

    zone := 0
    uploader := kodocli.NewUploader(zone, nil)

    log.Println("Uploading...")

    var ret PutRet
    res := uploader.PutFile(nil, &ret, token, key, filePath, nil)
    log.Println(ret)
    if res != nil {
        log.Println("io.Put failed:", res)
        return
    }
    
    log.Println("Done!")
}
