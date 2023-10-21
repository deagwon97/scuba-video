package route

import (
	"fmt"
	"net/http"
	"os"
	"scuba-video/file"
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
		"http://localhost:8000",
		"http://localhost:3000"}
	config.AllowHeaders = []string{"*"}
	config.AllowCredentials = true
	config.AllowMethods = []string{"DELETE", "PATCH", "POST", "GET"}

	r.Use(cors.New(config))
	r.Use(static.Serve("/", static.LocalFile("./frontend/build", true)))
	api := r.Group("/api")
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

	return r.Run(address)
}
