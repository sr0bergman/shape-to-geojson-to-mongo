// scraper.js
const AdmZip = require('adm-zip')
const Http = require('http')
const Fs = require('fs')
const Ogr2ogr = require('ogr2ogr')
const Turf = require('turf');
const config = require('./config');

process.env['theAssetMap'] = config.mongoConnection 

//CONNECT TO MONGODB PROCESS.ENV.THEASSETMAP
const dbCol = require('./dbCollectionsConnection.js')

"use strict"

module.exports = {
	start: () => {
		return new Promise( (resolve, reject) => {
			console.log('=======STARTING SCRAPE========')
			resolve()
		})
	},

	connectToDB: () => {
		return new Promise( (resolve, reject) => {
			dbCol.connect(process.env.theAssetMap, function(err) {
			    if (err) {
			      console.log('Unable to connect to Mongo DB.')
			      reject(err)
			    } else {
			      console.log("Mongo DB Connected")
			      resolve()
			    }
			})
		})
	},

	getData: (params) => {
		return new Promise( function(resolve, reject) {
			
			let download = (tempPath, outPath, filename, url) => {
				console.log('Starting Download')
				console.log('File Name: ' + filename)
				console.log('URL: ' + url)
				console.log()
				Http.get(url, (response) => {
					console.log('...')
		 			response.on('data', (data) => {
		 				Fs.appendFileSync(tempPath, data)
					})

		 			response.on('end', () => {
		 			 	let zip = new AdmZip(tempPath)
						zip.extractAllTo(outPath)
		 				Fs.unlink(tempPath, (err, fd) => {
		 					console.log(filename + ' downloaded and extracted')
		 					resolve(outPath)
		 				})
			 		})

		 		})
			}
			download(params.tempPath, params.outPath, params.filename, params.url)

		})
	},

	toGeojson: (path) => {
		return new Promise( function(resolve, reject) {
			let outPath = 'downloads/converted/geojson.json'
			let geoJSON = Ogr2ogr(path)
                    .format('geoJSON')
                    .project('EPSG:4326')
                    .skipfailures()
                    .timeout('1500000')
                    .options(config.ogrOptions) 
                    .stream()
				geoJSON.pipe(Fs.createWriteStream(outPath))
				.on('finish', () => { 
					console.log('Converted Shape to Geojon')
					resolve(outPath) 
				});
		})
	},

	processGeoJson: (path) => {
		return new Promise( function(resolve, reject) {
			const getDate =() =>{
				let date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
	   				month = (month < 10 ? "0" : "") + month;
	   			let day  = date.getDate();
	    			day = (day < 10 ? "0" : "") + day;
	    		return year + "-" + month + "-" + day
			}
			const featureCollection = JSON.parse(Fs.readFileSync(path))
			let promises = featureCollection.features.map((feat)=>{

					feat.geometry.coordinates[0] = parseFloat(feat.geometry.coordinates[0].toFixed(6))
					feat.geometry.coordinates[1] = parseFloat(feat.geometry.coordinates[1].toFixed(6))
					feat.properties['DATA PULL DATE'] = getDate()
					return feat
			})
			Promise.all(promises).then( (results) => {
				resolve(results)
			})
		})
	},

	insertGeoJsonToMongo:(data,collectionName) =>{
		return new Promise( (resolve, reject) => {
			let col = dbCol.get().collection(collectionName)
			    col.insert(data,{ ordered: false })
			    	.then(()=>{
			        	console.log('Insert completed')
			        	resolve()
			    	})
			    	.catch((err)=> {
			    		console.log('Error Inserting')
			    		reject(err)
			    	})
		})
	},

	dropCollection: (collectionName) => {
		return new Promise( (resolve, reject) => {
			let col = dbCol.get().collection(collectionName)
				col.drop({})
		    	.then(()=>{
		        	console.log('Collection Removed')
		        	resolve()
		    	})
		    	.catch((err)=>{
		    		reject(err)
		    	})
		})
	},

	renameCollection: (collectionName,newCollectionName) => {
		return new Promise( (resolve, reject) => {
			let col = dbCol.get().collection(collectionName)
				col.rename(newCollectionName)
		    	.then(()=>{
		        	console.log('Collection Renamed')
		        	resolve()
		    	})
		    	.catch((err)=>{
		    		reject(err)
		    	})
		})
	},

	ensureIndex: (collectionName,indexName) => {
		return new Promise( (resolve, reject) => {
			let col = dbCol.get().collection(collectionName)
				col.ensureIndex(indexName)
		    	.then(()=>{
		        	console.log('Index Added')
		        	resolve()
		    	})
		    	.catch((err)=>{
		    		reject(err)
		    	})
		})
	},

	cloesDb: () => {
		return new Promise( (resolve, reject) => {
			dbCol.close()
			console.log('Database Closed')
		})
	}



}
		
		
