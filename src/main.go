package main

import (
	"fmt"
	"net/http"
	"strings"

	"scuba-video/file"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		svc, err := file.NewS3Service()
		if err != nil {
			fmt.Println(err)
		}
		bucket := "scuba-basketball"
		resp, err := svc.ListObjectsV2(&s3.ListObjectsV2Input{Bucket: aws.String(bucket)})
		if err != nil {
			fmt.Println(err)
		}
		dirs := map[string][]string{}

		for _, object := range resp.Contents {
			dateKey := strings.Split(*object.Key, "/")
			if dateKey[1] == "" {
				continue
			}
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
