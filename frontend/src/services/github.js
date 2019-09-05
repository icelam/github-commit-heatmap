import axios from 'axios';

const getRepsitoriesDetails = () => axios.post(`${process.env.VUE_APP_API_DOMAIN}/graphql`, {
  query: `
  {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    viewer {
      repositories(first: 100, isFork: false, affiliations: OWNER, privacy: PUBLIC, orderBy: {field: NAME, direction: ASC}) {
        totalCount
        nodes {
          ... on Repository {
            name
            createdAt
            refs(refPrefix: "refs/heads/", first: 100) {
              nodes {
                name
                target {
                  ... on Commit {
                    history(author: {id: "MDQ6VXNlcjY3ODA0MjA="}) {
                      totalCount
                      edges {
                        node {
                          ... on Commit {
                            committedDate
                          }
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
  `
});

export default { getRepsitoriesDetails };
