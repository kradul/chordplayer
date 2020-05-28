
Utils = {};

//helper function for choosing a random note out of a list
Utils.random_index = function (arr) {
	return Math.floor(Math.random()*arr.length);
} 

Utils.random_element = function (arr) {
	return arr[Utils.random_index(arr)];
}