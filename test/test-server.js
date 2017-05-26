global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function() {
    var sampleID;
    var sampleID2;
    var sampleIDStr;

    beforeEach(function(done) {
        server.runServer(function() {
            Item.create({name: 'Broad beans'},
                {name: 'Tomatoes'},
                {name: 'Peppers'}, function(err, items) {
                    console.log('items in before code are:', items);
                // done();
                //Retrieve _id of item to be edited
                Item.find(function(err,items){
                    console.log('items are:', items);
                    sampleID = items[0]._id;
                    sampleIDStr = sampleID.toString();
                    sampleID2 = items[1]._id;
                    console.log('sampleID:', sampleID);
                    console.log('its type:', typeof sampleID);
                    done();
                });
            });
        });
    });

    afterEach(function(done) {
        Item.remove(function() {
            done();
        });
    });

    //****** get
    it('should list items on get', function(done){
        chai.request(app)
        .get('/items')
        .end(function(err, res) {
            should.equal(err, null);
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body.should.have.length(3);
            res.body[0].should.be.a('object');
            res.body[0].should.have.property('_id');
            res.body[0].should.have.property('name');
            res.body[0]._id.should.be.a('string');
                //24 char id
                // res.body[0]._id.should.equal(1);
                res.body[0].name.should.be.a('string');
                res.body[0].name.should.equal('Broad beans');
                res.body[1].name.should.equal('Tomatoes');
                res.body[2].name.should.equal('Peppers');
                done();
            });
    });
    //******* post
    it('should add an item on post', function(done){
        chai.request(app)
        .post('/items')
        .send({'name': 'Kale'})
        .end(function(err, res) {
            should.equal(err, null);
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('_id');
            res.body.name.should.be.a('string');
            res.body._id.should.be.a('string');
            res.body.name.should.equal('Kale');
                // res.body.id.should.equal(4);

                Item.find(function(err,items){
                    // console.log('What we got?:',items);

                    items.should.be.a('array');
                    items.should.have.length(4);
                    items[3].should.be.a('object');
                    items[3].should.have.property('_id');
                    items[3].should.have.property('name');
                    items[3]._id.should.be.a('object');

                    // items[3].id.should.equal(4);
                    console.log(typeof items[3]._id);
                    items[3].name.should.be.a('string');
                    items[3].name.should.equal('Kale');

                    done();
                });
                
                
            });
    });

    //******* put
    it('should edit an item on put', function(done){
        // done();
        console.log('in put, sampelID is', sampleID);
        
    

        //test
        chai.request(app)
        .put('/items/'+sampleID)
        .send({'name': 'Burger', 'id': sampleID})
        .end(function(err, res){
            should.equal(err, null);
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('_id');
            res.body.name.should.be.a('string');
            res.body._id.should.be.a('string');
            res.body.name.should.equal('Broad beans');
            res.body._id.should.equal(sampleIDStr);

            Item.find(function(err,items){
                console.log('items:', items);
                items.should.be.a('array');
                items.should.have.length(3);
                items[0].should.be.a('object');
                items[0].should.have.property('name');
                items[0].should.have.property('_id');
                items[0].name.should.be.a('string');
                items[0].name.should.equal('Burger');
                items[0]._id.should.be.a('object');
                console.log(typeof sampleID);
                console.log(typeof items[0]._id);

                items[0]._id.toString().should.equal(sampleIDStr);

                done();
            });
        });
        

    });

    it('should delete an item on delete', function(done){
        chai.request(app)
            .delete('/items/'+sampleID)
            .end(function(err, res){
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('_id');
                res.body.name.should.be.a('string');
                res.body._id.should.be.a('string');
                res.body.name.should.equal('Broad beans');
                res.body._id.should.equal(sampleIDStr);

                Item.find(function(err,items){
                    items.should.be.a('array');
                    items.should.have.length(2);
                    done();
                });
            });
    });

    it('should fail gracefully when req lacks necessary body data on post', function(done){
        chai.request(app)
            .post('/items')
            .send({'foo': 'bar'})
            .end(function(err, res){
                err.should.be.a('error');
                res.should.be.json;
                res.should.have.status(500);

                Item.find(function(err,items){
                    items.should.be.a('array');
                    items.should.have.length(3);
                    items[0].should.be.a('object');
                    done();
                });
                
            });
    });

    it('should fail gracefully when req includes something other than valid JSON on post', function(done){
        chai.request(app)
            .post('/items')
            .send('Not JSON')
            .end(function(err,res){
                err.should.be.a('error');
                res.should.have.status(500);

                Item.find(function(err,items){
                    items.should.be.a('array');
                    items.should.have.length(3);
                    items[0].should.be.a('object');
                    done();
                });
                
            });
    });

    it('should fail gracefully if no ID in endpoint on put', function(done){
        chai.request(app)
            .put('/items')
            .send({'name': 'Cookies', 'id': sampleID})
            .end(function(err,res){
                err.should.be.a('error');
                res.should.have.status(404);
                res.should.be.json;

                Item.find(function(err,items){
                    // console.log('items now are:', items);
                    items.should.be.a('array');
                    items.should.have.length(3);
                    items[0].should.be.a('object');
                    items[0].should.have.property('name');
                    items[0].should.have.property('_id');
                    items[0].name.should.be.a('string');
                    items[0]._id.should.be.a('object');
                    items[0].name.should.equal('Broad beans');
                    done();
                });
                
            });
    });

    it('should fail gracefully if ID in endpoint and req body don\'t match on put', function(done){
        chai.request(app)
            .put('/items/'+sampleID)
            .send({'name': 'Ice Cream', 'id': sampleID2})
            .end(function(err,res){
                // err.should.be.a('error');
                res.should.have.status(400);
                res.should.be.json;

                Item.find(function(err,items){
                    items.should.be.a('array');
                    items.should.have.length(3);
                    items[0].should.be.a('object');
                    done();
                });
                
            });
    });





});