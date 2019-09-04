<?php
ini_set("allow_url_fopen", true);
ini_set("display_errors", 0);

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');
header('Access-Control-Max-Age: 600');

include 'githubGraphQL.php';

$GithubGraphQL = new GithubGraphQL();

$request_method = $_SERVER['REQUEST_METHOD'];

// Get raw request body
$request_body = file_get_contents("php://input");

// Github API requires to have User Agent header
$request_header = array("User-Agent: " . $_SERVER['HTTP_USER_AGENT']);

$response = $GithubGraphQL->callAPI($request_method, $request_body, $request_header);

// Set HTTP status code and print result
http_response_code($response['status_code']);
echo $response['output'];
?>
