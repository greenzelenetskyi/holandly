### Requirements

1. typescript module installed globally (npm install typescript -g);
2. ts-node module installed globally (npm install typescript -g)

### How to Run

1. `npm install`
2. export mysql database:
     - create `holandly` database (utf8 collation)
     - mysql -u [username] -p holandly < holandly.sql
3. run `npm run start` to compile, copy static assets and run server
