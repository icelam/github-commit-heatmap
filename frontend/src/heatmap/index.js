import * as d3 from 'd3';

const heatmap = (elementSelector, w, h, xKeys, yKeys, dataset) => {
  // Shared colors
  const color = {
    label: '#767676',
    cells: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    tooltip: {
      background: '#ffffff',
      text: '#a8a8a8',
      textEmphsize: '#282828',
      shadow: 'rgba(40, 40, 40, 0.2)'
    },
    hr: '#dddddd'
  };

  // Build color scale
  const step = d3.scaleLinear()
    .domain([1, 5])
    .range([1, d3.max(dataset, (d) => d.value)]);

  const myColor = d3.scaleLinear()
    .domain([0, step(2), step(3), step(4), d3.max(dataset, (d) => d.value)])
    .range(color.cells);

  // Add tooltip to heatmap
  const _addTooltip = (dataCell) => {
    const touchDevice = 'ontouchstart' in window
      || (window.DocumentTouch && document instanceof window.DocumentTouch)
      || navigator.maxTouchPoints > 0
      || window.navigator.msMaxTouchPoints > 0;

    const tooltip = d3.select(elementSelector)
      .append('div')
      .style('position', 'absolute')
      .style('z-index', 1070)
      .style('display', 'none')
      .style('text-align', 'left')
      .style('font-size', '0.75em')
      .style('font-size', '0.75em')
      .style('word-wrap', 'break-word')
      // .style('opacity', '0')
      .style('background', color.tooltip.background)
      .style('box-shadow', `1px 1px 2px 1px ${color.tooltip.shadow}`)
      .style('padding', '0.6em 0.875em')
      .style('color', color.tooltip.text)
      .style('min-width', '100px');

    function _showTooltip(event, d) {
      const viewport = {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      };

      const tooltipSize = {
        width: 120,
        height: 80
      };

      // Get mouse position to calculate tooltip position
      // Default tooltip position is bottom right
      const tooltipPosition = {
        top: d3.pointer(event, document.querySelector('body'))[1],
        left: d3.pointer(event, document.querySelector('body'))[0]
      };

      const cursorSize = {
        width: 14,
        height: 20
      };

      // Adjust tooltip display position
      // Force to show on top left / top right on mobile
      // Adjust top or left when room is not enough.
      //
      // Assuming the tooltip size is roughly about 120px x 80px
      // So we are checking if we have 80px x 120px room to display tooltip
      // Move the tooltip to slightly apart form cursor using the cursor size
      const displayPosition = {
        top: tooltipPosition.top + (tooltipSize.height + cursorSize.height) >= viewport.height
          || touchDevice
          ? tooltipPosition.top - tooltipSize.height
          : tooltipPosition.top + cursorSize.height,
        left: tooltipPosition.left + (tooltipSize.width + cursorSize.width) >= viewport.width
          || (touchDevice && tooltipPosition.left - (tooltipSize.width + cursorSize.width) > 0)
          ? tooltipPosition.left - tooltipSize.width
          : tooltipPosition.left + cursorSize.width
      };

      tooltip
        .html(`
          <div class="tooltip__date">${d.day} ${d.hour}</div>
          <div class="tooltip__value" style="color: ${color.tooltip.textEmphsize}; font-size: 1.5em;">${d.value}</div>
          <div tooltip__unit>Commits</div>
        `)
        .style('top', `${displayPosition.top}px`)
        .style('left', `${displayPosition.left}px`);
    }

    function _mouseover() {
      tooltip
        .style('display', 'block');
    }

    function _mousemove(event, data) {
      _showTooltip(event, data);
    }

    function _mouseout() {
      tooltip.style('display', 'none');
    }

    function _touchstart(event, data) {
      _mouseover();
      _showTooltip(event.touches[0], data);
    }

    if (touchDevice) {
      dataCell
        .on('touchstart', _touchstart)
        .on('touchend', _mouseout)
        .on('touchcancel', _mouseout);
    } else {
      dataCell
        .on('mouseover', _mouseover)
        .on('mousemove', _mousemove)
        .on('mouseout', _mouseout);
    }
  };

  // Draw heatmap
  const _drawHeatmap = () => {
    // Dimensions and margins for heatmap
    const margin = {
      top: 0,
      right: 0,
      bottom: 15,
      left: 30
    };

    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;

    // Add heatmap svg
    const svg = d3.select(elementSelector)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Build X scales and axis of heatmap
    const x = d3.scaleBand()
      .range([0, width])
      .domain(xKeys)
      .padding(0.1);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('color', color.label)
      .style('font-family', 'inherit')
      .call(d3.axisBottom(x).tickSize(0))
      .select('.domain')
      .remove();

    // Build Y scales and axis of heatmap
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(yKeys)
      .padding(0.2);

    svg.append('g')
      .attr('color', color.label)
      .style('font-family', 'inherit')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain')
      .remove();

    // Draw data of heatmap
    const dataCell = svg.selectAll()
      .data(dataset, (d) => (`${d.day}':${d.hour}`))
      .enter()
      .append('rect');

    dataCell
      .attr('x', (d) => x(d.day))
      .attr('y', (d) => y(d.hour))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d) => myColor(d.value));

    _addTooltip(dataCell);
  };

  // Draw legend
  const _drawLegend = () => {
    // Legend properties
    const legendMargin = {
      top: 10,
      right: 0,
      bottom: 0,
      left: 0
    };

    const legendData = [0, step(2), step(3), step(4), d3.max(dataset, (d) => d.value)];
    const legendDataLength = legendData.length;
    const legendPadding = 5;
    const legendCellSize = {
      width: (w - (legendPadding * (legendDataLength - 1))) / legendDataLength,
      height: 12
    };

    const legendText = {
      size: 10,
      lineHeight: 12
    };

    const legendHeight = legendMargin.top + legendCellSize.height + legendText.lineHeight;

    // Add legend svg
    const legend = d3.select(elementSelector)
      .append('svg')
      .attr('width', w)
      .attr('height', legendHeight)
      .append('g')
      .selectAll()
      .data(legendData, (d) => d);

    legend
      .enter()
      .append('g')
      .append('line')
      .attr('x1', 0)
      .attr('y1', 2)
      .attr('x2', w)
      .attr('y2', 2)
      .attr('stroke-width', 1)
      .attr('stroke', color.hr);

    const legendCell = legend
      .enter()
      .append('g');

    legendCell
      .append('rect')
      .attr('x', (d, i) => legendCellSize.width * i + (legendPadding * i))
      .attr('y', legendMargin.top)
      .attr('width', legendCellSize.width)
      .attr('height', legendCellSize.height)
      .style('fill', (d, i) => color.cells[i]);

    legendCell
      .append('text')
      .attr('fill', color.label)
      .style('font-size', `${legendText.size}px`)
      .style('line-height', `${legendText.lineHeight}px`)
      .text((d) => `≥ ${Math.round(d)}`)
      .attr('x', (d, i) => legendCellSize.width * i + (legendPadding * i) + 2)
      .attr('y', legendMargin.top + legendCellSize.height + legendText.lineHeight);
  };

  const _draw = () => new Promise((resolve, reject) => {
    try {
      _drawHeatmap();
      _drawLegend();

      resolve(true);
    } catch (err) {
      reject(err);
    }
  });

  return {
    draw: _draw
  };
};

export default heatmap;
