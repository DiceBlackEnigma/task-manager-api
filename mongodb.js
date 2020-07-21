// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID;
const { MongoClient, ObjectId } = require('mongodb');

const connectionUrl = `mongodb://127.0.0.1:27017`;
const databaseName = `task-manager`;

MongoClient.connect(connectionUrl, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.error('Unable to connect to database');
    }

    const db = client.db(databaseName);
    db.collection('tasks')
        .deleteOne({
            completed: true
        })
        .then( result => console.log(result))
        .catch( err => console.error(err));
});
