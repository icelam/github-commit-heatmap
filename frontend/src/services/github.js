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
              isArchived
              defaultBranchRef {
                target {
                  ... on Commit {
                    history {
                      totalCount
                      edges {
                        node {
                          ... on Commit {
                            committedDate
                            author {
                                name
                            }
                          }
                        }
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
  `
});

export default { getRepsitoriesDetails };
