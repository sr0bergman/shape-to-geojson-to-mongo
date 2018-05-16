
const Scraper = require('./scrapper')
const Fs = require('fs')
const config = require('./config')
const paramsObj = {}
        paramsObj.url =  config.shapeUrl 
        paramsObj.filename = config.fileName 
        paramsObj.tempPath = 'downloads/temp/' + paramsObj.filename + '.zip'
        paramsObj.outPath = 'downloads/extracted/' + paramsObj.filename

console.log('Running....')
function doScrape(){
    return Promise.resolve(
        
        Scraper.start()
        .then(()=> Scraper.connectToDB() )      
        .then(()=> Scraper.getData(paramsObj) )
        .then(path=> Scraper.toGeojson(path) )
        .then(path=> Scraper.processGeoJson(path) )
        .then(data=> Scraper.insertGeoJsonToMongo(data,config.mongoTempCollection) )
        .then(()=> Scraper.dropCollection(config.mongoDataCollection) )
        .then(()=> Scraper.renameCollection(config.mongoTempCollection,config.mongoDataCollection) )
        .then(()=> Scraper.ensureIndex(config.mongoDataCollection,config.mongoIndex) )
        .then(()=> Scraper.cloesDb() )
        .catch(function(err) {
            console.log(err)
            console.log('There was a problem....');
        })
    )
}
doScrape()
