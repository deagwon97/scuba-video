package file

import (
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func NewS3Service() (svc *s3.S3, err error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("ap-northeast-1"),
	})
	if err != nil {
		log.Fatalf("Failed to create session: %s", err)
	}
	svc = s3.New(sess)
	return
}
