<?php
include "partials/db.inc.php";



function get()
{



$mySelect = "SELECT * FROM products";


$productsStatement = $link->query($mySelect);
$productsStatement->execute();

$products = $productsStatement->fetchAll();


//header('Content-Type: application/json');

print "<div>" . json_encode($products) . "</div>";

}


function post()
{


}



switch ($_SERVER['REQUEST_METHOD'])
{
	case "get":
	case "GET":
		get();
		
	break;

	case "post":
	case "POST":
		post();
	break;


}





$link = null;
