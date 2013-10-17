




var Vent = function()
{

}

_.extend(Vent.prototype, Backbone.Events);

var vent = new Vent();

var Product = Backbone.Model.extend({
	defaults:function()
	{
		return{
			colors:[],
			brandName:"",
			name:"",
			imgSrc:"",
			price: 0,
			promotionPrice: 0,
			numInCart:0
		}
	},

	initialize:function()
	{

		this.on("addToCart", this.addToCart, this);
	},

	addToCart:function()
	{

		vent.trigger("addToCart", this);
	}
});




var Inventory = Backbone.Collection.extend(
{
	model:Product
});


var ShoppingCart = Backbone.Collection.extend(
{
	model:Product,

	initialize:function()
	{
		vent.on("addToCart", this.addToCart, this);
	},

	addToCart:function(model)
	{
		this.add(model);
	}
});

var inventory = new Inventory();

inventory.reset([
	{
		colors:["green", "blue"],
		brandName:"Adidas",
		name:"Adidas F50 Adizero Cleat",
		imgSrc:"images/image.jpg",
		price: 123,
		promotionPrice: 12
	},
	{
		colors:["green", "blue"],
		brandName:"Adidas",
		name:"Adidas F50 Adizero Cleat",
		imgSrc:"images/image.jpg",
		price: 123,
		promotionPrice: 12
	}


	]);

console.log(inventory);

$(document).ready(function(){



});












