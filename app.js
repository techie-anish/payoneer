const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');
const _ = require('lodash');
const path = require('path');

const util = require('util');
const Payoneer = require('./lib/payoneer');

const {User} = require('./models/user')

require('dotenv').config({path: path.resolve(__dirname+'/.env')});

const port = process.env.PORT || 3000;
console.log("Environment: " + process.env.NODE_ENV);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public/')));
app.set('view engine', pug);

const payoneer = new Payoneer({
    uri: process.env.URI,
    username: process.env.PARTNER_USERNAME,
    apiPassword: process.env.PARTNER_API_PASSWORD,
    partnerId: process.env.PARTNER_ID
});

app.get('/',(req, res) => {
    // Return the status of the API
    payoneer.echo().then(function(data) {
        console.log('Response:');
        console.log(util.inspect(data, { depth: null, colors: true }));
        res.render('index.pug');
    }).catch(function(error) {
        console.log(error.message);
    });
});

app.post('/payoneer/pay', (req, res) => {
    // Submit a payment request to Payoneer's system
    payoneer.sendPayment('AGILITYFEAT100069280-PAY', 9, 10, 20, 'Created from the wrapper', null, null, 'USD').then(function(data) {
        console.log('Response:');
        console.log(util.inspect(data, { depth: null, colors: true }));
        response = JSON.parse(data);
        res.redirect(response.data.authorization_url);
    }).catch(function(error) {
        console.log(error.message);
        return res.redirect('/error');
    });
});

app.get('/payoneer/callback', (req,res) => {
    // Report the status of a payment that was previously sent to Payoneer system
    payoneer.getPaymentStatus(10, 7).then(function(data) {
        console.log('Response:');
        console.log(util.inspect(data, { depth: null, colors: true }));
        response = JSON.parse(data);        
        const data1 = _.at(response.data, ['note', 'amount','user.email', 'metadata.full_name']);
        [note, amount, email, full_name] =  data1;
        newUser = {note, amount, email, full_name}
        const user = new User(newUser)
        user.save().then((user)=>{
            if(!user){
                return res.redirect('/error');
            }
            res.redirect('/receipt/'+user._id);
        }).catch((e)=>{
             res.redirect('/error');
        });
    }).catch(function(error) {
        console.log(error.message);
        return res.redirect('/error');
    });
});

app.get('/receipt/:id', (req, res) => {
    const id = req.params.id;
    User.findById(id).then((user)=>{
        if(!user){
            //handle error when the user is not found
            res.redirect('/error')
        }
        res.render('success.pug',{user});
    }).catch((e)=>{
        res.redirect('/error')
    })
})

app.get('/error', (req, res)=>{
    res.render('error.pug');
})

app.listen(port, () => {
    console.log(`App running on port ${port}`)
});
