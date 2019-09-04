<template>
  <div>
    <div class="container" v-show="pageReady">
      <h3>Github Commit Heatmap</h3>
      <div id="chart"></div>
    </div>

    <error-message message="Failed to generate heatmap :(<br/><br/>Check your internet connection or retry later." v-show="pageError" />

    <loading v-show="!pageReady && !pageError" />
  </div>
</template>

<script>
import moment from 'moment-timezone';
import heatmap from '@heatmap';
import { DAY_KEYS, HOUR_KEYS } from '@constants/constants';
import githubService from '@services/github';

import loading from '@components/loading';
import errorMessage from '@components/errorMessage';

export default {
  components: {
    loading,
    errorMessage,
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
        const repoHistories = data.data.viewer.repositories.nodes.map(
          repo => repo.defaultBranchRef.target.history.edges
        );

        const commitDayTime = repoHistories.flat().map(
          (commit) => {
            const commitTime = moment(commit.node.committedDate);
            return {
              day: commitTime.tz('Asia/Taipei').format('ddd'),
              hour: commitTime.tz('Asia/Taipei').format('ha')
            };
          }
        );

        const commitStatistics = commitDayTime.reduce((obj, dataset) => {
          if (typeof obj[dataset.day] !== 'object') {
            obj[dataset.day] = {};
          }

          obj[dataset.day][dataset.hour] = obj[dataset.day][dataset.hour] + 1 || 1;

          return obj;
        }, {});

        const d3Dataset = DAY_KEYS.flatMap(day => HOUR_KEYS.map(hour => ({
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
