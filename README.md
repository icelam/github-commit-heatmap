# Github Commit Day / Time Heatmap #

> Heatmap of Github Commit Day / Hour using Github GraphQL API and D3.js.

### API endpoint ###
You will need to [create a Github Personal Access Token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) to acess the GraphQL API provided by Github.

In order to protect the token, I have wrapped the API using PHP, so the token will not be directly exposed in client side. The source code can be found in `/api/`. To add your token, got to `/api/githubGraphQL.php` and replace the following line:
```
$this->scrap_headers = array("Authorization: Bearer <PERSONAL_ACCESS_TOKEN>");
```

### Node version ###
* Node >= 10

### Changing API Endpoint ###
* `.env` > `VUE_APP_API_DOMAIN`

### Changing App Domain (Used for meta and open graph tags in HTML templates) ###
* `.env` > `VUE_APP_DOMAIN`

### Changing App Context ###
* `.env` > `VUE_APP_CONTEXT`

### Run project ###
Go to `/frontend` folder and run the following command:
* `npm install`
* `npm run dev`

### Build production ###
Go to `/frontend` folder and run the following command:
* `npm run build`
