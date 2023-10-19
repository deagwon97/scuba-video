package file

import (
	"fmt"
	"os"

	minio "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func NewMinioClient() (minioClient *minio.Client, err error) {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("ACCESS_KEY_ID")
	secretAccessKey := os.Getenv("SECRET_ACCESS_KEY")
	useSSL := true

	minioClient, err = minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		fmt.Println(err)
		return
	}
	return
}
