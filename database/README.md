# Database

## Configuration
In the .env file, include
```
MONGO_STAGE={stage}
MONGO_URL={database docker service name}
```

The database can start with data stored in the data directory. Changes made are saved in the data directory.

## Running the database
```
docker compose build database
```

```
docker compose up [-d] database
```

If running the service in the background, it can be taken down with
```
docker compose down database
```

## Make sure it works
In MongoDB Compass, 
```
mongodb://localhost:27017
```
