# Backend

## Running the backend

```
docker compose build backend
```

```
docker compose up [-d] backend
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
docker compose down backend
```

## Make sure it works

In your browser,

```
localhost:3000/test_auth
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

## Debug Endpoints (only exposed when testing)

### GET /test_auth

Returns a message to test your auth status
