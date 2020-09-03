<template>
  <div>
    <div class="container" v-show="pageReady">
      <h3>Github Commit Heatmap</h3>
      <div id="chart"></div>
    </div>

    <error-message
      message="Failed to generate heatmap :(<br/><br/>Check your internet connection or retry later."
      v-show="pageError"
    />

    <loading v-show="!pageReady && !pageError" />
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import moment from 'moment-timezone';
import loading from '@components/loading';
import errorMessage from '@components/errorMessage';
import githubService from '@services/github';
import { DAY_KEYS, HOUR_KEYS } from '@constants/constants';
import heatmap from '@heatmap';

export default {
  components: {
    loading,
    errorMessage
  },
  data() {
    return {
      pageReady: false,
      pageError: false
    };
  },
  methods: {
    async getRepoHistories() {
      try {
        const { data } = await githubService.getRepsitoriesDetails();
        const nextPageCursors = [];

        // Get all repositories and its branch first, return the data in a flattern array
        const repoBranches = data.data.viewer.repositories.nodes.flatMap(
          (repo) => repo.refs.nodes.map((branch) => {
            if (branch.target.history.pageInfo.hasNextPage) {
              nextPageCursors.push({
                repository: repo.name,
                branch: branch.name,
                cursor: branch.target.history.pageInfo.endCursor
              });
            }

            return {
              repository: repo.name,
              branch: branch.name,
              target: branch.target
            };
          })
        );

        // Get all remaining paginations as Github GraphQL only allow getting 100 commit histories
        // Since the total number of pagination is unknown, we use:
        // - `while` loop instead of recursion to prevent exceeding maximum call stack
        // - `await` to prevent exceeding Github API limit (calls per seconds) although it is slower
        const repoBranchesPagination = [];

        while (nextPageCursors.length) {
          const cursor = nextPageCursors.pop();

          // eslint-disable-next-line no-await-in-loop
          const { data: nextPageData } = await githubService.getCommitsByRepository(
            cursor.repository,
            cursor.branch,
            cursor.cursor
          );

          const { target } = nextPageData.data.viewer.repository.refs.nodes[0];
          const { history: { pageInfo } } = target;

          if (pageInfo.hasNextPage) {
            nextPageCursors.push({
              repository: cursor.repository,
              branch: cursor.branch,
              cursor: pageInfo.endCursor
            });
          }

          repoBranchesPagination.push({
            repository: cursor.repository,
            branch: cursor.branch,
            target
          });
        }

        // Extract and flat all histories
        const repoHistories = [
          ...repoBranchesPagination,
          ...repoBranches
        ].flatMap(
          (branch) => branch.target.history.edges
        );

        return repoHistories;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    deduplicateCommitHistory(data) {
      const commitHistoryHashmap = {};
      return data
        ? data.filter((history) => {
          if (!commitHistoryHashmap[history.node.oid]) {
            commitHistoryHashmap[history.node.oid] = true;
            return true;
          }
          return false;
        })
        : null;
    },
    async generateChart(data) {
      try {
        // Extract date and time of commits in Hong Kong timezone
        const commitDayTime = data.map(
          (commit) => {
            const commitTime = moment(commit.node.committedDate).tz('Asia/Taipei');
            return {
              day: commitTime.format('ddd'),
              hour: commitTime.format('ha')
            };
          }
        );

        // Count day / time
        const commitStatistics = commitDayTime.reduce((obj, dataset) => {
          if (typeof obj[dataset.day] !== 'object') {
            obj[dataset.day] = {};
          }

          obj[dataset.day][dataset.hour] = obj[dataset.day][dataset.hour] + 1 || 1;

          return obj;
        }, {});

        // Transform the data for D3 to use
        const d3Dataset = DAY_KEYS.flatMap((day) => HOUR_KEYS.map((hour) => ({
          day,
          hour,
          value: typeof commitStatistics[day] === 'object' && commitStatistics[day][hour]
            ? commitStatistics[day][hour]
            : 0
        })));

        const gitCommitHeatmap = heatmap('#chart', 280, 455, DAY_KEYS, HOUR_KEYS, d3Dataset);

        await gitCommitHeatmap.draw();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  },
  async mounted() {
    const commitHistory = await this.getRepoHistories();
    const deduplicatedCommitHistory = this.deduplicateCommitHistory(commitHistory);
    const generateSuccess = deduplicatedCommitHistory && await this.generateChart(deduplicatedCommitHistory);
    this.pageError = !generateSuccess;
    this.pageReady = generateSuccess;
  }
};
</script>

<style lang='scss' scoped>
  @import '~@style/_colors.scss';

  #chart {
    display: inline-block;
    background: $color-chart-background;
    padding: 10px;
    border-radius: 8px;
    margin: 0 0 10px 0;

    > /deep/ svg {
      display: block;
    }
  }
</style>
