# <center> FUN APP </center>

## Description

### This my nestJs solution to eSEED assessment. 

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# first run the docker container to start the postgres container using this command

$ docker compose up

# There is a pre start:dev script that uses prisma seed to initialize some date for testing purposes. So we can run the start:dev script directly.

# watch mode
$ yarn run start:dev
```

## Test

```bash
# unit tests
$ yarn run test
```

## Swagger
### You can check out the swagger documentation from here

### http://localhost:3000/api-docs# 

## Database
### You can check a ui version of the database using prisma studio, just type this command and you will be redirected to it on our browser.

```bash
$ npx prisma studio
```