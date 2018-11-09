$(document).ready(function(){

	$('.splash').delay('2000').fadeOut('slow');
	
	$(".btn-fav").click(function() {
		let getCity = JSON.parse(localStorage.getItem("city"));
		let getReg = JSON.parse(localStorage.getItem("region"));
		let city = $("#city option:selected").text();
		let reg = $("#region option:selected").text();
		console.log(city);
		console.log(reg);
		// let favObj = [ {city: getCity, reg: getReg} ]
		
		if (getCity) {
			let indexCity = getCity.findIndex( value => value === city );
			if ( indexCity >= 0 ){
				newFavsCity = [ ...getCity];
				newFavsCity.splice(indexCity, 1);
			} else{
				newFavsCity = [ ...getCity, city ];
			}
		} else {
			newFavsCity = [ city ];
		}


		if (getReg) {
			let indexReg = getReg.findIndex( value => value === reg );
			if ( indexReg >= 0 ){
				newFavsReg = [ ...getReg];
				newFavsReg.splice(indexReg, 1);
			} else{
				newFavsReg = [ ...getReg, reg ];
			}
		} else {
			newFavsReg = [ reg ];
		}
		let favObj = [ {city: newFavsCity, reg: newFavsReg} ];
		newFavObj = [favObj];
		localStorage.setItem("city", JSON.stringify(newFavsCity));
		localStorage.setItem("region", JSON.stringify(newFavsReg));

	})

	$('#city').val('sp');
	$('#city').change(getMessengerLocations);
	
});


function getMessengerLocations() {
	let city = $('#city').find(":selected").text();
  
  // Get coordinates of selected city
  // let city = 'Rio de Janeiro';
  let cityCoordinates = allCities.filter(item => item.name === city);  
  let center = {lat: cityCoordinates[0]['coordinates'][0], lng: cityCoordinates[0]['coordinates'][1]};

	let queryDrivers = `
			{
			closestDrivers(productType: 0, transportType: "1", lat:${center.lat}, lng:${center.lng}, radius: 12.0, limit: 500) {
				driversCount
				readyDriversCount
				busyDriversCount
				drivers {
					 lng
					lat
					busy
				}
			}
		} 
		`;

	requestLoggiAPI(queryDrivers)
	.then(response => response.json())
	.then(data => {
		let messengerLocations = data['data']['closestDrivers']['drivers'].filter(item => item.busy === false)
		// console.log(messengerLocations);
		return initMap(messengerLocations, center.lat, center.lng, data)
	});
}

function requestLoggiAPI(query) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'ApiKey laboratoria@loggi.com:22ab838e8afa1c6774e75ab62df38e5074dd84b3'
		},
		credentials: 'include',
		body: JSON.stringify({
			operationName: null,
			query,
			variables: {}
		})
	}
	return fetch(`https://www.loggi.com/graphql`, options);
}

function insertAmountInformation(data) {
	const totalDrivers = data['data']['closestDrivers']['driversCount'];
	$('.total-number').html(totalDrivers);

	const availableDrivers = data['data']['closestDrivers']['readyDriversCount'];
	$('.available-number').html(availableDrivers);

	const unavailableDrivers = data['data']['closestDrivers']['busyDriversCount'];
	$('.unavailable-number').html(unavailableDrivers);
}