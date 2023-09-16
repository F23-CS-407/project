# Database

## Configuration
In the .env file, include
```
MONGO_USER={USERNAME}
MONGO_PASSWORD={PASSWORD}
```

The database can start with data stored in the data directory, the mongo username and mongo password must match. Changes made are saved in the data directory.

## Running the database
```
docker compose build database
```

```
docker compose up [-d] database
```

If running the services are running in the background, they can be taken down with
```
docker compose down database
```

## Make sure it works
In MongoDB Compass, 
```
localhost:3000/test
```
should display
```
test
```
