




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
		colors:["black"],
		brandName:"Adidas",
		gender: "Men",
		name:"Adidas 11 Pro Adipure Cleat",
		imgSrc:"images/products/adidas_mens_adipure_11Pro_trx_fg_cleats.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["red", "blue"],
		brandName:"Adidas",
		gender: "Men",
		name:"Adidas F30 Messi TRX Cleat",
		imgSrc:"images/products/adidas_mens_f30_trx_fg_Messi.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["purple", "pink", "blue"],
		gender: "Men",
		brandName:"Adidas",
		name:"Adidas F50 Adizero TRX Cleat",
		imgSrc:"images/products/adidas_mens_f50_adizero_trx_fg_cleats.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["black", "green"],
		gender: "Men",
		brandName:"Adidas",
		name:"Adidas Predator Absolado LZ Cleat",
		imgSrc:"images/products/adidas_mens_predator_absolado_lz_trx_fg_soccer_cleats_green.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["black", "yellow"],
		gender: "Men",
		brandName:"Adidas",
		name:"Adidas Predator Absolado TRX FG Cleat",
		imgSrc:"images/products/adidas_mens_predator_absolado_lz_trx_fg_soccer_cleats_yellow.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["purple", "white"],
		gender: "Women",
		brandName:"Adidas",
		name:"Adidas F5 TRX FG Cleat",
		imgSrc:"images/products/adidas_womens_f5_trx_fg_soccer_cleat.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["black", "white"],
		gender: "Men",
		brandName:"New Balance",
		name:"New Balance 5464 Cleat",
		imgSrc:"images/products/new_balance_5464_lacrosse_cleats_men.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["gray", "white"],
		gender: "Men",
		brandName:"New Balance",
		name:"New Balance MB4040 Cleat",
		imgSrc:"images/products/new_balance_mb4040_d_width_low_cut_baseball_cleats_men.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["orange", "black"],
		gender: "Men",
		brandName:"Nike",
		name:"Nike Hypervenom Phelon Cleat",
		imgSrc:"images/products/nike_hypervenom_phelon_fg_outdoor_soccer_cleats_mens.jpg",
		price: 123,
		promotionPrice: 12.12
	},
	{
		colors:["orange", "black"],
		gender: "Men",
		brandName:"Nike",
		name:"Nike Mercurial Victory II Cleat",
		imgSrc:"images/products/nike_mercurial_victory_II_fg_soccer_cleats_mens.jpg",
		price: 123,
		promotionPrice: 12.12
	}
	]);

console.log(inventory);

$(document).ready(function(){



});












