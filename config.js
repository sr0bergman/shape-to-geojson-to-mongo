//config
module.exports = {

	shapeUrl: 'http://cogcc.state.co.us/documents/data/downloads/gis/WELLS_SHP.ZIP', //shape urls
	fileName: 'cogcc_wells', //file name
	ogrOptions: ['-where', "Facil_Stat IN ('PR','DG','WO','XX')"], //Ogr2Ogr options
	mongoConnection: 'mongodb://XXXX:XXXX@XXXX:XXXX,XXXX:XXXX/XXXX?replicaSet=set-XXXXX', //Your Mongo Connection Details
	mongoTempCollection: '__Temp_data', //temporary mongo collection
	mongoDataCollection: '__My_New_Data_Collection', //mongo collection
	mongoIndex:'Facil_Stat' //mongo index value

}