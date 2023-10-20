package route

import (
	"fmt"
	"net/http"
	"scuba-video/file"
	"scuba-video/model"
	"sort"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Run(address string) error {
	r := gin.New()
	api := r.Group("/api")
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:8000",
		"http://localhost:3000"}
	config.AllowHeaders = []string{"*"}
	// config.AllowCredentials = true
	config.AllowMethods = []string{"DELETE", "PATCH", "POST", "GET"}

	api.Use(cors.New(config))

	api.POST("/presinged", func(c *gin.Context) {

		fmt.Println("presingedUrl")

		// secret := c.PostForm("secret")
		// if secret != "scuba" {
		// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		// 	return
		// }

		// svc, err := file.NewS3Service()
		// if err != nil {
		// 	fmt.Println(err)
		// }
		// bucket := "scuba-basketball"
		// objectKey := c.Query("objectKey")
		// req, _ := svc.PutObjectRequest(&s3.PutObjectInput{
		// 	Bucket: aws.String(bucket),
		// 	Key:    aws.String(objectKey),
		// })
		// if err != nil {
		// 	fmt.Println(err)
		// }
		// expiration := 15 * time.Minute

		// url, err := req.Presign(expiration)
		// if err != nil {
		// 	fmt.Println(err)
		// }

		data := gin.H{
			"url": "",
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
