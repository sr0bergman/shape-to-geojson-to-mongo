var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var state = {
  db: null,
}

exports.connect = function(url, done) {
  if (state.db) return done()

  MongoClient.connect(url, function(err, db) {
    if (err) return done(err)
    state.db = db
    done()
  })
}
exports.get = function() {
  return state.db
}
exports.create = function(colName){
  if (state.db) {
    state.db.createCollection(colName,function(err,collection){
      if (err) return (err)
        return true
    })
  }
}
exports.drop = function(colName){
  if (state.db) {
    state.db.collection(colName).drop(function(err,response){
      if (err) return (err)
        return true
    })
  }
}
exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      //done(err)
    })
  }
}
