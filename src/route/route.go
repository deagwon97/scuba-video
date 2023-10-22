package route

import (
	"fmt"
	"net/http"
	"os"
	"scuba-video/file"
	"scuba-video/model"
	"sort"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

func Run(address string) error {
	r := gin.New()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"https://video.scuba.deagwon.com",
		"https://dev.video.scuba.deagwon.com",
		"http://localhost:8000",
		"http://localhost:3000"}
	config.AllowHeaders = []string{"*"}
	config.AllowCredentials = true
	config.AllowMethods = []string{"DELETE", "PATCH", "POST", "GET"}

	r.Use(cors.New(config))
	r.Use(static.Serve("/", static.LocalFile("./frontend/build", true)))
	api := r.Group("/api")

	api.DELETE("/object", func(c *gin.Context) {
		var secretKey struct {
			Secret string `json:"secret"`
		}
		if err := c.ShouldBindJSON(&secretKey); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		secret := os.Getenv("SECRET")
		if secretKey.Secret != secret {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		svc, err := file.NewS3Service()
		if err != nil {
			fmt.Println(err)
		}
		bucket := "scuba-basketball"
		objectKey := c.Query("objectKey")
		_, err = svc.DeleteObject(&s3.DeleteObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(objectKey),
		})
		if err != nil {
			fmt.Println(err)
		}
		c.JSON(http.StatusOK, gin.H{"result": "success"})
	})

	api.POST("/presinged", func(c *gin.Context) {

		var secretKey struct {
			Secret string `json:"secret"`
		}
		if err := c.ShouldBindJSON(&secretKey); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		secret := os.Getenv("SECRET")
		if secretKey.Secret != secret {
			fmt.Println(secretKey.Secret, secret)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		svc, err := file.NewS3Service()
		if err != nil {
			fmt.Println(err)
		}
		bucket := "scuba-basketball"
		objectKey := c.Query("objectKey")
		fileType := c.Query("fileType")

		req, _ := svc.PutObjectRequest(&s3.PutObjectInput{
			Bucket:      aws.String(bucket),
			Key:         aws.String(objectKey),
			ContentType: aws.String(fileType),
		})
		if err != nil {
			fmt.Println(err)
		}
		expiration := 15 * time.Minute

		url, err := req.Presign(expiration)
		if err != nil {
			fmt.Println(err)
		}

		data := gin.H{
			"url": url,
		}
		c.JSON(http.StatusOK, data)
	})
	api.GET("/list", func(c *gin.Context) {
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
		dirsSlice := []string{}
		for date := range dirs {
			dirsSlice = append(dirsSlice, date)
		}
		sort.Sort(sort.Reverse(sort.StringSlice(dirsSlice)))
		dirVideosList := []model.DirVideos{}
		for _, date := range dirsSlice {
			dirVideos := model.DirVideos{Dir: date, Videos: dirs[date]}
			dirVideosList = append(dirVideosList, dirVideos)
		}
		if err != nil {
			return
		}
		data := gin.H{
			"result": dirVideosList,
		}
		c.JSON(http.StatusOK, data)
	})
	return r.Run(address)
}
