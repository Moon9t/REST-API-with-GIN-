FROM golang:1.21-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . ./
RUN cd cmd/api && CGO_ENABLED=0 GOOS=linux go build -o /app/api ./

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /app/api /usr/local/bin/api
EXPOSE 8080
ENV PORT=8080
CMD ["/usr/local/bin/api"]
