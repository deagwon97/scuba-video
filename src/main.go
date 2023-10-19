package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"scuba-video/file"

	"github.com/gin-gonic/gin"
	minio "github.com/minio/minio-go/v7"
)

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		minioClient, err := file.NewMinioClient()
		if err != nil {
			fmt.Println(err)
			return
		}
		opts := minio.ListObjectsOptions{
			Recursive: true,
		}
		objects := minioClient.ListObjects(context.Background(), "scuba", opts)
		dirs := map[string][]string{}

		for object := range objects {
			if object.Err != nil {
				fmt.Println(object.Err)
				return
			}
			dateKey := strings.Split(object.Key, "/")
			date := dateKey[0]
			key := dateKey[1]
			dirs[date] = append(dirs[date], key)
		}
		if err != nil {
			return
		}
		data := gin.H{
			"Dirs": dirs,
		}
		c.HTML(http.StatusOK, "index.tmpl", data)
	})

	r.GET("/video", func(c *gin.Context) {
		object := c.Query("object")
		data := gin.H{
			"Path": object,
		}
		c.HTML(http.StatusOK, "video.tmpl", data)
	})

	// Set the directory for templates
	r.LoadHTMLGlob("templates/*")
	r.Static("/pwa", "./pwa")
	r.GET("/service-worker.js", func(c *gin.Context) {
		c.File("./pwa/service-worker.js")
	})

	r.Run(":80")
}
