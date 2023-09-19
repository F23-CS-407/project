# Backend

## Running the backend
```
docker compose build backend
```

```
docker compose up [-d] backend
```

If running the services are running in the background, they can be taken down with
```
docker compose down backend
```

## Make sure it works
In your browser, 
```
localhost:3000/test
```
should display
```
test
```
