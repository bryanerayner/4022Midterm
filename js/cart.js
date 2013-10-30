var ReboundSports = new Backbone.Marionette.Application();

var CartRegion = Backbone.Marionette.Region.extend({
	el: "#checkout",
	open:function(view)
	{
		this.$el.find("#cart").remove();
		this.$el.append(view.$el);
		this.$el.off("click").on("click", function(e){

			//We only want to open the shopping cart if you click on the button.
			//Prevent everything except for what we explicitly want.
			var trigger = false;
			var $target = $(e.target);
			if($target.is("h3"))
			{
				trigger = true;
			}
			var classes = [];
			var ids = ["cartContainer", "checkout"];
			_.each(classes, function(className){
				if ($target.hasClass(className))
				{
					trigger = true;
				}
			});
			_.each(ids, function(id){
				if ($target.attr("id") == id)
				{
					trigger = true;
				}
			});

			if (trigger)
			{
				ReboundSports.vent.trigger("click:#checkout");
			}
		});
	}
});

ReboundSports.addRegions({
	inventory:"#products",
	cart:CartRegion
})

//Function to format a price as good lookin' HTML.
function formatPrice(price)
{
	var integer = Math.floor(price);
	var decimals = Math.floor((price-integer)*100);
	if (decimals < 10)
	{decimals = "0"+decimals;}
	return "$"+integer+"<sup>"+decimals+"</sup>";
}


var ProductBase = Backbone.Model.extend(
{
	defaults:function()
	{
		return{
			colors:[],
			brandName:"",
			name:"",
			imgSrc:"",
			price: 0,
			promotion:false,
			promotionPrice: 0,
			numInCart:0
		}
	},
	initialize:function()
	{
		this.on("change:price change:promotion change:promotionPrice", this.updateActualPrice, this);
	},
	updateActualPrice:function()
	{
		if (this.get("promotion") && this.get("promotionPrice"))
		{
			this.set("actualPrice", this.get("promotionPrice"));
		}else
		{
			this.set("actualPrice", this.get("price"));
		}
	}
})

var Product = ProductBase.extend({


	initialize:function()
	{
		ProductBase.prototype.initialize.apply(this, arguments);
		this.on("addToCart", this.addToCart, this);
	},

	addToCart:function()
	{
		this.changeNumInCart(1);
	},

	removeFromCart:function()
	{
		this.changeNumInCart(-1);
	},

	changeNumInCart:function(delta, fixed)
	{
		var newVal = Math.max(0, ((fixed) ? 0 : this.get("numInCart")) + delta);
		this.set("numInCart", newVal);	
	}
});

var Inventory = Backbone.Collection.extend(
{
	model:Product,
	cartTotalNum: 0,
	cartTotalPrice: 0,
	initialize:function()
	{
		this.on("change:numInCart", this.updateCartTotal, this);
	},
	updateCartTotal:function()
	{
		this.trigger("before:updateCartTotal");
		var totalNum = totalPrice = 0;
		this.each(function(model)
		{
			totalNum += model.get("numInCart");
			totalPrice += model.get("numInCart") * model.get("actualPrice");
		});
		this.cartTotalPrice = totalPrice;
		this.cartTotalNum = totalNum;

		this.trigger("after:updateCartTotal");
	}
});


var ProductBaseView = Backbone.Marionette.ItemView.extend(
{
		//Format the model to be displayed correctly.
	serializeData:function()
	{
		//Make the prices formatted correctly here.
		var data = _.clone(this.model.attributes);

		var prices = ["price","promotionPrice"];
		_.each(prices, function(price)
		{
			if (data[price])
			{
				data[price] = formatPrice(data[price]);
			}
		});

		return data;
	}
})

var ProductView = ProductBaseView.extend({
	template:Handlebars.compile( $("#productTemplate").html()),
	tagName:"div",
	className:"product",

	events:
	{
		"click .add-to-cart.button":"addToCart"
	},

	initialize:function()
	{
		this.listenTo(this.model, "change:numInCart", this.updateCartNum);
	},

	addToCart:function()
	{
		this.model.trigger("addToCart");
	},

	updateCartNum:function()
	{
		var $cartCounter = this.$(".cart-counter");
		var $addToCartButton = this.$(".add-to-cart.button");
		var numInCart = this.model.get("numInCart");
		$cartCounter.find("span").html(numInCart);
		if (numInCart > 0)
		{
			$cartCounter.show();
			$addToCartButton.text("Add Another");
		}else
		{
			$cartCounter.hide();
			$addToCartButton.text("Add To Cart");
		}
	},


});

var CartProductView = ProductBaseView.extend({
	template:Handlebars.compile( $("#cartProductTemplate").html()),
	tagName:"div",
	className:"cartProduct",

	events:
	{
		"click .add-to-cart.button":"addToCart"
	},

	initialize:function()
	{
		this.listenTo(this.model, "change:numInCart", this.updateNumInCart);
	},

	updateNumInCart:function()
	{
		var numInCart = this.model.get("numInCart");
		if (numInCart > 0)
		{
			this.$el.show();
		}else
		{
			this.$el.hide();
		}
	},

	addToCart:function()
	{
		this.model.trigger("addToCart");
	},
	onRender:function()
	{
		if (this.model.get("numInCart") == 0)
		{
			this.$el.hide();
		}
	}
});

var InventoryView = Backbone.Marionette.CollectionView.extend({
	template:Handlebars.compile( $("#inventoryTemplate").html()),
	tagName:"div",
	id:"inventory",
	itemView:ProductView,
})


var ShoppingCartView = Backbone.Marionette.CollectionView.extend(
{
	template:Handlebars.compile($("#cartTemplate").html()),
	tagName:"div",
	id:"cartContainer",
	itemView:CartProductView,

	events:{
		"click #cart":"preventDefault",
	},


	initialize:function()
	{
		_.extend(this,{
			expanded:false,
			preventDefault:false
		});
		ReboundSports.vent.on("click:#checkout", this.toggleExpanded, this);
		this.listenTo(this.collection, "after:updateCartTotal", this.updateCartTotal);
	},
	preventDefault:function(e)
	{
		this.preventDefault = true;
		e.preventDefault();
		e.stopPropagation();
	},

	toggleExpanded:function(e)
	{
		if (this.preventDefault)
		{
			this.preventDefault = false;
			return;
		}
		this.expanded = !!!this.expanded;
		this.updateExpanded();
	},

	onRender:function()
	{
		this.$el.prepend("<h3>Shopping Cart</h3>");
		this.delegateEvents(this.events);
		this.updateCartTotal();
		this.updateExpanded();
	},

	updateExpanded:function()
	{
		if (this.expanded)
		{
			if (this.collection.cartTotalNum == 0)
			{
				this.toggleExpanded();
				return;
			}
			this.$("#cart").show();
		}else
		{
			this.$("#cart").hide();
		}
	},

	updateCartTotal:function()
	{
		var productsInCart = this.collection.cartTotalNum;
		var totalPrice = this.collection.cartTotalPrice;

		var $checkoutH3 = this.$("h3");
		if (productsInCart > 0)
		{
			$checkoutH3.text("Checkout " + productsInCart + " items");
		}else
		{
			$checkoutH3.text("Shopping Cart");
			this.expanded = false;
			this.updateExpanded();
		}
	},

	appendHtml: function(collectionView, itemView, index){
		if (collectionView.$el.find("#cart").length < 1)
		{
			collectionView.$el.append('<div id = "cart"></div>');
		}
	    collectionView.$el.find("#cart").append(itemView.el);
	}

});



//Initializers

ReboundSports.addInitializer(function(options){
	var inventoryView = new InventoryView({
		collection: options.inventory
	});
	ReboundSports.inventory.show(inventoryView);
	var cartView = new ShoppingCartView({
		collection: options.inventory
	});
	ReboundSports.cart.show(cartView);
});


//View for inventory


var inventory = new Inventory([
	{
		id:1,
		colors:["black"],
		brandName:"Adidas",
		gender: "Men",
		name:"Adidas 11 Pro Adipure Cleat",
		imgSrc:"images/products/adidas_mens_adipure_11Pro_trx_fg_cleats.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:2,
		colors:["red", "blue"],
		brandName:"Adidas",
		gender: "Men",
		name:"Adidas F30 Messi TRX Cleat",
		imgSrc:"images/products/adidas_mens_f30_trx_fg_Messi.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:3,
		colors:["purple", "pink", "blue"],
		gender: "Men",
		brandName:"Adidas",
		name:"Adidas F50 Adizero TRX Cleat",
		imgSrc:"images/products/adidas_mens_f50_adizero_trx_fg_cleats.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:4,
		colors:["black", "green"],
		gender: "Men",
		brandName:"Adidas",
		name:"Adidas Predator Absolado LZ Cleat",
		imgSrc:"images/products/adidas_mens_predator_absolado_lz_trx_fg_soccer_cleats_green.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:5,
		colors:["black", "yellow"],
		gender: "Men",
		brandName:"Adidas",
		name:"Adidas Predator Absolado TRX FG Cleat",
		imgSrc:"images/products/adidas_mens_predator_absolado_lz_trx_fg_soccer_cleats_yellow.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:6,
		colors:["purple", "white"],
		gender: "Women",
		brandName:"Adidas",
		name:"Adidas F5 TRX FG Cleat",
		imgSrc:"images/products/adidas_womens_f5_trx_fg_soccer_cleat.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:7,
		colors:["black", "white"],
		gender: "Men",
		brandName:"New Balance",
		name:"New Balance 5464 Cleat",
		imgSrc:"images/products/new_balance_5464_lacrosse_cleats_men.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:8,
		colors:["gray", "white"],
		gender: "Men",
		brandName:"New Balance",
		name:"New Balance MB4040 Cleat",
		imgSrc:"images/products/new_balance_mb4040_d_width_low_cut_baseball_cleats_men.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:9,
		colors:["orange", "black"],
		gender: "Men",
		brandName:"Nike",
		name:"Nike Hypervenom Phelon Cleat",
		imgSrc:"images/products/nike_hypervenom_phelon_fg_outdoor_soccer_cleats_mens.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	},
	{
		id:10,
		colors:["orange", "black"],
		gender: "Men",
		brandName:"Nike",
		name:"Nike Mercurial Victory II Cleat",
		imgSrc:"images/products/nike_mercurial_victory_II_fg_soccer_cleats_mens.jpg",
		price: 123,
		promotion:true,
		promotionPrice: 12.12
	}
	]);

console.log(inventory);

$(document).ready(function(){
	ReboundSports.start({inventory:inventory});



});












