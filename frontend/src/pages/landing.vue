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
    generateChart() {
      githubService.getRepsitoriesDetails().then(({ data }) => {
        // Get all repositories and its branch first, return the data in a flattern array
        const repoBranches = data.data.viewer.repositories.nodes.flatMap(
          (repo) => repo.refs.nodes
        );

        // Extract and flat all histories
        const repoHistories = repoBranches.flatMap(
          (branch) => branch.target.history.edges
        );

        // Extract date and time of commits in Hong Kong timezone
        const commitDayTime = repoHistories.map(
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
          value: typeof commitStatistics[day] === 'object' && commitStatistics[day][hour] ? commitStatistics[day][hour] : 0
        })));

        const gitCommitHeatmap = heatmap('#chart', 280, 455, DAY_KEYS, HOUR_KEYS, d3Dataset);
        gitCommitHeatmap.draw().then(() => {
          this.pageReady = true;
        }).catch(() => {
          this.pageError = true;
        });
      }).catch((err) => {
        this.pageError = true;
      });
    }
  },
  mounted() {
    this.generateChart();
  },
  computed: {

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
