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

Return

```
{
    "_id": string,
    "username": string,
    "password_hash": string,
    "salt": string,
    "__v": number
}
```

Errors

```
"Missing username or password", "Login failed"
```

### DELETE /logout

If logged in, Return

```
{
    "confirmation": "Logged out successfully"
}
```

Errors

```
"Not logged in"
```

### POST /create_user

Body

```
{
    "username": string,
    "password": string
}
```

Return

```
{
    "_id": string,
    "username": string,
    "password_hash": string,
    "salt": string,
    "__v": number
}
```

Errors

```
"Username or password missing",
"Username taken"
```

### DELETE /delete_user

Body

```
{
    "password": string
}
```

If logged in, Return

```
{
    "confirmation": "Deleted account"
}
```

Errors

```
"Missing password", "Password mismatch", "Not logged in"
```

### GET /user_info

If logged in, Return

```
{
    "_id": string,
    "username": string,
    "password_hash": string,
    "salt": string,
    "__v": number
}
```

Error

```
"Not logged in"
```

### POST /create_community

Body

```
{
    "name" : string,
    "description" : string,
    "mods" : [(string)UserId, ...]
}
```

Return

```
{
    "name": string,
    "description": string,
    "mods": [
        (string)UserId,
        ...
    ],
    "posts": [],
    "_id": string,
    "__v": number
}
```

Error

```
"Community name required",
"Community description required",
"At least one mod is required",
"Invalid ObjectId in mods array",
"A community with this name already exists"
```

### GET /search_communities?name=(string)

**Performs Non-case sensitive Regex Match**

Return

```
[
    {
        "_id": string,
        "name": string,
        "description": string,
        "mods": [
            (string)UserId,
            ...
        ],
        "posts": [(string)PostId, ...],
        "__v": number
    },
    ...
]
```

### GET /search_users?username=(string)

**Performs Non-case sensitive Regex Match**

Return

```
[
    {
        "_id": string,
        "username": string,
        "password_hash": string,
        "salt": string,
        "__v": number
    },
    ...
]
```

### GET /find_user?username=(string)

**Performs case sensitive Match**

Return

```
{
    "_id": string,
    "username": string,
    "password_hash": string,
    "salt": string,
    "__v": number
}
```

### GET /find_user_by_id?user_id=(string)

Return

```
{
    "_id": string,
    "username": string,
    "password_hash": string,
    "salt": string,
    "__v": number
}
```

Error

```
"user_id missing",
"Invalid user id"
```

### GET /search_community_by_post_id?post_id=(string)

Return

```
{
    "_id": string,
    "name": string,
    "description": string,
    "mods": [
        (string)UserId, ...
    ],
    "posts": [
        (string)PostId, ...
    ],
    "__v": number
}
```

### POST /create_post

Body

```
{
    "post" : {"content" : string,
                         "tags" : [string, ...]},
    "community" : string,
    "user" : string
}
```

Return

```
{
    "content": string,
    "created_by": string,
    "created_date": Date,
    "tags": [string,
        ...
    ],
    "liked_by": [],
    "comments": [],
    "_id": string,
    "__v": number
}
```

Error

```
"No post data",
"There is no content in the post",
"A post must exist in a community",
"Invalid community ID",
"A user must make a post",
"Invalid User ID"
```

### GET /community/posts?community=(string)

Return

```
[
    {
        "_id": string,
        "content": string,
        "created_by": string,
        "created_date": Date,
        "tags": [
            String, ...
        ],
        "liked_by": [ (string)UserId, ...],
        "comments": [ (string)CommentId, ... ],
        "__v": number
    },
    ...
]
```

Error

```
"A community is required",
"Invalid Community ID"
```

### GET /user/posts?user_id=(string)

Return

```
[
    {
        "_id": string,
        "content": string,
        "created_by": string,
        "created_date": Date,
        "tags": [
            String, ...
        ],
        "liked_by": [ (string)UserId, ...],
        "comments": [ (string)CommentId, ...],
        "__v": number
    }
]
```

Error

```
"A user is required",
"Invalid Community ID"
```

### POST /like/post

Body

```
{
    "post" : string,
    "user" : string
}
```

Return

```
{
    "_id": string,
    "content": string,
    "created_by": string,
    "created_date": Date,
    "tags": [
        string, ...
    ],
    "liked_by": [
        (string)UserId,
        ...
    ],
    "comments": [
        (string)CommentId,
        ...
    ],
    "__v": number
}
```

Error

```
"No post ID provided",
"No user ID provided",
"Invalid post ID",
"Invalid user ID",
"Post not found",
"User has already liked this post"
```

### DELETE /like/post

Body

```
{
    "post" : string,
    "user" : string
}
```

Return

```
{
    "_id": string,
    "content": string,
    "created_by": string,
    "created_date": Date,
    "tags": [
        string, ...
    ],
    "liked_by": [
        (string)UserId,
        ...
    ],
    "comments": [
        (string)CommentId,
        ...
    ],
    "__v": number
}
```

Error

```
"No post ID provided",
"No user ID provided",
"Invalid post ID",
"Invalid user ID",
"Post not found, or internal server error",
"User did not already like this post"
```

### GET /post/likes?post=(string)

Return

```
[
    {
        "_id": string,
        "username": string,
        "password_hash": string,
        "salt": string,
        "__v": number
    },
    ...
]
```

Error

```
"No post ID provided",
"Invalid post ID"
```

### GET /post/user_liked?post=(string)&user=(string)

Return

if user liked

```
1
```

if user not liked

```
0
```

Error

```
"No post ID provided",
"No user ID provided",
"Invalid post ID",
"Invalid user ID",
"Post not found"
```

### POST /create_comment

Body

```
{
    "comment" : {
        "content" : string
    },
    "post" : string,
    "user" : string
}
```

Return

```
{
    "content": string,
    "children_comments": [],
    "created_by": string,
    "created_date": string,
    "_id": string,
    "__v": number
}
```

Error **These are not JSON objects, they are text**

```
"No comment data",
"There is no content in this comment",
"A new top level comment requires a post ID",
"Invalid post id",
"No user ID given",
"Invalid User ID"
```

### GET /post/comments

Return

```
[
    {
        "_id": string,
        "content": string,
        "children_comments": [
            (string)CommentId, ...
        ],
        "created_by": string,
        "created_date": Date,
        "__v": number
    },
    ...
]
```

Error **These are not JSON objects, they are text**

```
"A post ID is required",
"Invalid post ID"
```

## Debug Endpoints (only exposed when testing)

### GET /test_auth

Returns a message to test your auth status
