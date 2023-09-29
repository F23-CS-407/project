# Project

## Docker Engine
In Docker Desktop, go to settings -> general. Select "gRPC FUSE" and uncheck "Use Virtualization framework". Apply and restart.

## Starting the Services
```
docker compose build
```
```
docker compose up [-d]
```

If running the services in the background, they can be taken down with
```
docker compose down
```
