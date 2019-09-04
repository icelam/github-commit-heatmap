<?php
class GithubGraphQL {
  public function __construct() {
    // API endpoint
    $this->api_endpoint = "https://api.github.com/graphql";

    // Github personal access token
    $this->scrap_headers = array("Authorization: Bearer <PERSONAL_ACCESS_TOKEN>");
  }

  public function callAPI($request_method, $request_body, $request_headers) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $this->api_endpoint);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array_merge($this->scrap_headers, $request_headers));

    $post_data = $request_body;

    // Convert to JSON when needed
    if(!$this->isValidJson($request_body)) {
      $post_data = json_encode($request_body);
    }

    switch ($request_method) {
      case "GET":
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
        break;
      case "POST":
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
        break;
      case "PUT":
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
        break;
      case "DELETE":
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
        break;
    }

    // DO not print result directly
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $server_output = curl_exec ($curl);

    // Get HTTP status code
    $http_status_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

    curl_close ($curl);

    return array(
      "status_code" => $http_status_code,
      "output" => $server_output
    );
  }

  private function isValidJson($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
  }
}
?>
