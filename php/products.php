<?php
include "partials/db.inc.php";



function get($link)
{



$mySelect = "SELECT * FROM products";


$productsStatement = $link->query($mySelect);
$productsStatement->execute();

$products = $productsStatement->fetchAll();


header('Content-Type: application/json');

//Convert the colors string to a proper array.
foreach ($products as $key => $product) {
	$stringSrc = $product["product_colors"];
	$stringSrc = str_replace('"', '', $stringSrc);
	$arr = explode(",", $stringSrc);	
	unset($products[$key]['product_colors']);
	$products[$key]['product_colors'] = $arr;
}

echo json_encode($products);

}


function post($link)
{


}



switch ($_SERVER['REQUEST_METHOD'])
{
	case "get":
	case "GET":
		get($link);
	break;

	case "post":
	case "POST":
		post($link);
	break;
}





$link = null;