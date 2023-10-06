# Backend

The backend should run through the proxy when also running with the frontend. Through the proxy, localy, the backend is at

```
localhost:8080/api
```

If you wanted to run /login you would go to

```
localhost:8080/api/login
```

## Running the backend

```
docker compose up --build [-d] backend
```

If running the service in the background, it can be taken down with

```
docker compose down backend
```

## Running tests

```
docker compose build backend_tests
```

```
docker compose up [-d] backend_tests
```

If the service is running in the background, it can be taken down with

```
docker compose down backend_tests
```

## Endpoints

### POST /login

Body

```
{
    "username": string,
    "password": string
}
```

Returns
Error message or User object

### DELETE /logout

If logged in destroys session

### POST /create_user

Body

```
{
    "username": string,
    "password": string
}
```

Returns
Error message or User object

### DELETE /delete_user

Body

```
{
    "password": string
}
```

Returns
Error message or "Deleted account"

## Debug Endpoints (only exposed when testing)

### GET /test_auth

Returns a message to test your auth status
