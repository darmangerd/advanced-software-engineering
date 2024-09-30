# todo-backend-node-koa


## Configuration
[todo backend](http://todobackend.com) using Node.js with [Koa](https://koajs.com/).

## Usage
1. Using docker, go to the root of the project and run the following command:
```bash
docker-compose up --build --force-recreate
```

2. The server is now running on `http://localhost:8080`.

3. To stop the server run the following command:
```bash
docker-compose down
``` 

### Miscellaneous
If the datas are not created at start it may be the rights of the init script that are not set correctly. You can fix it by running the following command:
```bash
chmod 644 init_db.sql
```