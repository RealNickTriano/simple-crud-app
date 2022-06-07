// require express
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const PORT = 3000;
const connectionString = 'mongodb+srv://koalabear:XRUDlAgJtnPSY2fU@cluster0.zeegg.mongodb.net/?retryWrites=true&w=majority';

// Set view engine to ejs
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());

// Connect to mongoDB
MongoClient.connect(connectionString, (err, client) => {
    // do stuff
    if (err) return console.error(err);
    console.log('Connected to Database');
    const db = client.db('star-wars-quotes');
    const quotesCollection = db.collection('quotes');

    // Route handlers
    app.get('/', (req, res) => {
        // res.send('Hello World');
        // res.sendFile(__dirname + '/index.html');
        db.collection('quotes').find().toArray()
            .then(results => {
                res.render('index.ejs', { quotes: results });
            })
            .catch(error => console.error(error));
        
    })

    app.post('/quotes', (req, res) => {
        quotesCollection.insertOne(req.body);
        res.redirect('/');
    })

    app.put('/quotes', (req, res) => {
        quotesCollection.findOneAndUpdate(
            { name: 'Yoda' }, // query (filter collection by key-value)
            { //update (use update operators to tell what to change)
                $set: {
                    name: req.body.name,
                    quote: req.body.quote
                }
            },
            { // options (define additional options for the request)
                // if no quote exists create new quote
                upsert: true
            }
        )
            .then(result => {
                res.json('Success');
            })
            .catch(error => console.error(error));

        console.log(req.body);
    })

    app.delete('/quotes', (req, res) => {
        // Handle delete event
        quotesCollection.deleteOne(
            { name: req.body.name } // query
            // options
        )
            .then(result => {
                if (result.deletedCount === 0){
                    return res.json('No quote to delete')
                }
                res.json(`Deleted Darth Vadar's quote`)
            })
            .catch(error => console.error(error))
    })

    // listen on port
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`);
    })
})

