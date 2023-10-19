FROM golang:latest AS builder
COPY ./src /workdir/src
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOROOT=/usr/local/go \
    GOPATH=/workdir/go \
    PATH=$PATH:/usr/local/go/bin

RUN go install -v golang.org/x/tools/gopls@latest
RUN go install -v github.com/cweill/gotests/gotests@v1.6.0
RUN go install -v github.com/fatih/gomodifytags@v1.16.0
RUN go install -v github.com/josharian/impl@v1.1.0
RUN go install -v github.com/haya14busa/goplay/cmd/goplay@v1.0.0
RUN echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.bashrc


WORKDIR /workdir/src
RUN go mod tidy
RUN go build -o main ./

FROM scratch AS production
WORKDIR /root
COPY --from=builder /workdir/src/main /root/main
COPY --from=builder /workdir/src/templates /root/templates
COPY --from=builder /workdir/src/pwa /root/pwa
COPY --from=builder /etc/ssl/certs /etc/ssl/certs
ENTRYPOINT ["./main"]