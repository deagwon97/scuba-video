# scuba-video

### 기능

1. 동영상 목록조회
    - https://video.scuba.deagwon.com
    - 동영상 목록을 날짜순으로 구분하여 정렬
    - 패이징 x
      
2. 동영상 조회
    - https://video.scuba.deagwon.com?object={{object경로}}
    - presignd url 사용 x, read-only public으로 공개된 s3 버킷 사용
    
3. 동영상 업로드
   - file, secret-key, directory-name
   - presignd url 사용 o
   - 암호 사용 o

4. 동영상 삭제
   - file object-key, secret-key
   - 암호 사용 o

5. PWA
   - 안드로이드 및 ios 설치 지원
