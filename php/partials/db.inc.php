<?php

$dbname = "reflex_sports";
$dbuser = "root";
$dbpass = "";
$dbhost = "localhost";

$link = new PDO("mysql:host=". $dbhost . ";dbname=" . $dbname, $dbuser, $dbpass );