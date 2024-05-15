# # How to run up project step by step:

## Step 1: run docker environment
### if MacOS platform:
make run-app
### if WindowOS platform:
docker build -t amplifier-data-bangkeo . && docker-compose up -d

## Step 2: login by bellow api in Postman to get Baerer Token 
curl --location 'http://localhost:3000/users/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "admin",
    "password": "password"
}'

## Step 2: Put Baerer Token when call another api in Backend


# Output
http://localhost:3000/