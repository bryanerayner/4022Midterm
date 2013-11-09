//Animate a div to fade vertically.

function fade($el, pDelta, duration)
{
	var len = duration || 300;
	var delta = pDelta || 40

	//First ensure that all the parents of this element are visible. If not, stop
	//before we start
	var $parents = $el.parents();
	if ($parents.is(":hidden"))
	{
		return;
	}


	var $clone = $el.clone();
	var docPosition = $el.offset();

	//Properly position this div underneath other ones potentially sitting on top of it.
	var highestZIndex = _.max($parents, function(div){
		var z = $(div).css("z-index");
		if (z == "auto"){return 0;}
		return parseInt(z);
	});

	$clone.css("z-index", $(highestZIndex).css("zIndex"));


	$clone.offset(docPosition);
	$clone.css(
		{"position":"absolute"}
		);
	$clone.appendTo("body");
	_.defer(function(){
		$clone.addClass("animate-fade");
		$clone.css({
			"zoom":1,
			"opacity":0,
			"-moz-opacity":0,
		});
		$clone.offset({left:docPosition.left, top:docPosition.top - delta});
	});
	_.delay(function(){
		$clone.remove()
	}, len);
}

function fadeUp($el, ammount)
{
	fade($el, ammount);
}
function fadeDown($el, ammount)
{
	fade($el, -ammount)
}





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

function transformKeys(data, keyMap, direction)
{
	var transformMap = _.clone(keyMap);
	if (direction == "inverse")
	{
		transformMap = _.invert(transformMap);
	}
	var transform = _.extend({}, data);
		_.each(transformMap, function(value, key){
			transform[value] = transform[key];
			delete transform[key];
		});
	return transform;
}


var ProductBase = Backbone.Model.extend(
{

	url:"php/products.php",

	keyMap:
	{
		"product_id":"id",
		"product_name":"name",
		"product_colors":"colors",
		"brand_name":"brandName",
		"product_image":"imgSrc",
		"product_price":"price",
		"promotion_price":"promotionPrice",
		"promotion_active":"promotion",
		"product_gender":"gender"
	},

	parse:function(response)
	{
		
		var transform = transformKeys(response, this.keyMap);

		transform["imgSrc"] = "images/products/" + transform["imgSrc"];

		return transform;
	},

	serialize:function()
	{
		var data = _.clone(this.attributes);
		data["imgSrc"] = data["imgSrc"].replace("images/products", "");
		var transform = transformKeys(this.attributes, this.keyMap, "inverse");
		return transform;
	},

	sync: function(method, model, options) {
	  if (method !== 'read' && method !== 'destroy') {
	    options.data = model.serialize();
	  }
	  return Backbone.sync(method, model, options);
	},

	toJSON:function()
	{

	},

	defaults:function()
	{
		return{
			colors:[],
			brandName:"",
			name:"",
			imgSrc:"",
			price: 0,
			gender:"",
			promotion:false,
			promotionPrice: 0,
			numInCart:0,
			totalPrice:0
		}
	},
	initialize:function()
	{
		this.on("change:price change:promotion change:promotionPrice", this.updateActualPrice, this);
		this.on("change:numInCart", this.updateTotalPrice, this);
		this.updateActualPrice();
	},
	updateTotalPrice:function()
	{
		this.set("totalPrice", this.get("actualPrice")*this.get("numInCart"));
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
		this.on("removeFromCart", this.removeFromCart, this);
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
	url:"php/products.php",
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

		var prices = ["price","promotionPrice","totalPrice"];
		_.each(prices, function(price)
		{
			if (data[price])
			{
				data[price] = formatPrice(data[price]);
			}
		});

		return data;
	},

	fadeNumInCart:function($cartCounter)
	{
		var fadeDelta = -40;
		if (this.model.get("numInCart") > this.model.previous("numInCart"))
		{
			fadeDelta = fadeDelta * -1;
		}
		fade($cartCounter, fadeDelta);
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
		this.oldNumInCart = 0;
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

		this.fadeNumInCart($cartCounter.find("span"));

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
		"click .add-to-cart.button":"addToCart",
		"click .remove-from-cart.button":"removeFromCart"
	},

	initialize:function()
	{
		this.listenTo(this.model, "change:numInCart", this.updateNumInCart);
	},

	updateNumInCart:function()
	{
		var numInCart = this.model.get("numInCart");
		var me = this;
		if (numInCart > 0)
		{			
			this.$el.show();
			this.fadeNumInCart(this.$(".numInCart"));
			this.$(".numInCart").text(numInCart);
			this.$(".total").html(formatPrice(this.model.get("totalPrice")));
		}else
		{
			this.$el.hide();
		}
	},

	addToCart:function()
	{
		this.model.trigger("addToCart");
	},

	removeFromCart:function()
	{
		this.model.trigger("removeFromCart");
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
		var me = this;
		//Clicks away hide this div.
		$(document).on("mouseup",function (e)
		{
		    var container = $("#checkout").add(".button");

		    if (!container.is(e.target) // if the target of the click isn't the container...
		        && container.has(e.target).length === 0) // ... nor a descendant of the container
		    {
		        me.expanded = false;
		        me.updateExpanded();
		    }
		});
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
		this.$el.find("#cart").append('<div class = "checkoutTotal"><h4 class = "col-7-8">Cart Total:</h4><p class = "total col-1-8">0<sup>00</sup></p></div><div class = "checkout button">Checkout</div>');

		this.$el.find("#cart").addClass("slide-in-bottom");

		this.delegateEvents(this.events);
		this.updateCartTotal();
		this.updateExpanded();
	},

	updateExpanded:function()
	{

		var me = this;
		var show = false;

 
		if (this.expanded)
		{
			if (this.collection.cartTotalNum == 0)
			{
				this.toggleExpanded();
				return;
			}

			show = true;

			
		}else
		{
			
			
		}

		this.toggleDisplay(show, this);
	},

	toggleDisplay: _.throttle(function(showHide, ctx)
	{
		var $cart = ctx.$("#cart");
		if (showHide)
		{
			if (ctx.hidePtr)
			{
				window.clearTimeout(ctx.hidePtr);
			}
			$cart.show();
			_.defer(function(){$cart.addClass("show");});
			
		}
		else
		{
			$cart.removeClass("show");
			ctx.hidePtr = window.setTimeout(function(){
				$cart.hide();
			}, 500);
		}
	}, 200),

	updateCartTotal:function()
	{
		var productsInCart = this.collection.cartTotalNum;
		var totalPrice = this.collection.cartTotalPrice;

		var $checkoutH3 = this.$("h3");
		if (productsInCart > 0)
		{
			$("#checkout").addClass("show");
			$checkoutH3.text("Checkout " + productsInCart + " items");
			this.$(".checkoutTotal .total").html(formatPrice(totalPrice));
		}else
		{
			$("#checkout").removeClass("show");
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


var inventory = new Inventory([]);







$(document).ready(function(){
	ReboundSports.start({inventory:inventory});

	inventory.fetch();


	$(window).scroll( function(e){
		var maxHeight = $("body .products").height();
		var scrollTop = $(window).scrollTop();
		var navHeight = $("nav.left").height();
		var maxMinNavNeight = maxHeight - navHeight;
		var $mainNav = $(".MainNav");
		if (scrollTop > 0)
		{
		if ($(window).scrollTop() < maxMinNavNeight)
		{
		$mainNav.css("margin-top", Math.min($(window).scrollTop(),maxHeight));
		}else
		{
			$mainNav.css("margin-top", maxMinNavNeight);
			e.preventDefault();
		}
		}else
		{
			$mainNav.css("margin-top", "0");
		}
	});
	


});












