import * as d3 from 'd3';

const heatmap = (elementSelector, w, h, xKeys, yKeys, dataset) => {
  const color = {
    label: '#767676',
    cells: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
    tooltip: {
      background: '#ffffff',
      text: '#a8a8a8',
      textEmphsize: '#282828',
      shadow: 'rgba(40, 40, 40, 0.2)'
    }
  };

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

    function _showTooltip(_this, d) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const chartOffset = document.querySelector(`${elementSelector} > svg`).getBoundingClientRect();

      const viewport = {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      };

      // Get mouse position to calculate tooltip position
      // Issue on d3 returned mouse position when svg is being centered
      // So we are calculating offset ourselves
      // And add some spacing to make some space between the tooltip and mouse cursor
      const tooltipPosition = {
        top: d3.mouse(_this)[1] + chartOffset.top + 20,
        left: d3.mouse(_this)[0] + chartOffset.left + 40
      };

      // Adjust tooltip display position
      // Force to show on top left / top right on mobile
      // Adjust top or left when room is not enough.
      //
      // Assuming the tooltip size is about 100px x 70px with 10px spacing around
      // So we are checking if we have 80px x 110px room to display tooltip
      const displayPosition = {
        top: tooltipPosition.top + 80 >= viewport.height || touchDevice
          ? tooltipPosition.top - 100 + scrollTop
          : tooltipPosition.top + scrollTop,
        left: tooltipPosition.left + 110 >= viewport.width
          ? tooltipPosition.left - 140
          : tooltipPosition.left
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

    function _mousemove(d) {
      const _this = this;
      _showTooltip(_this, d);
    }

    function _mouseout() {
      tooltip.style('display', 'none');
    }

    function _touchstart(d) {
      const _this = this;
      _mouseover();
      _showTooltip(_this, d);
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

  // Draw Heatmap
  const _draw = () => new Promise((resolve, reject) => {
    try {
      // Dimensions and margins for heatmap
      const margin = {
        top: 0,
        right: 0,
        bottom: 15,
        left: 30
      };

      const width = w - margin.left - margin.right;
      const height = h - margin.top - margin.bottom;

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

      // Build color scale
      const step = d3.scaleLinear()
        .domain([1, 5])
        .range([1, d3.max(dataset, (d) => d.value)]);

      const myColor = d3.scaleLinear()
        .domain([0, step(2), step(3), step(4), d3.max(dataset, (d) => d.value)])
        .range(color.cells);

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
