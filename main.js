// in global: d3
const spinner = document.querySelector("#spinner");
function removeSpinner() {
  if (spinner.classList.contains("spinner")) {
    spinner.classList.remove("spinner");
  }
  spinner.style.display = "none";
}

let chartCounter = 0;

d3.json("manifest.json")
  .then(async manifest => {
    // this seems to render in the correct order,
    // rather than use forEach
    for (let path of manifest) {
      await drawChart(path);
    }
  })
  .catch(err => {
    throw new Error(err);
  });

async function drawChart(file) {
  function render(data) {
    // build top svg and append class no.
    const svg = d3
      .select("#charts")
      .append("div")
      .attr("class", d => `chart-${chartCounter}`)
      .append("svg")
      .attr("width", 960)
      .attr("height", 500);

    // iteration counter for color changes
    // multiply to ensure it's even, then modulo by 12
    const iteration = (chartCounter * 2) % 12;
    if (chartCounter === 1) {
      removeSpinner();
    }
    chartCounter += 1;

    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = {
      left: 80,
      top: 50,
      right: 30,
      bottom: 70
    };
    const xValue = d => d.word;
    const yValue = d => d.total;
    const xAxisLabel = "Word";
    const yAxisLabel = "# of Uses";
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const stackFields = Object.keys(data[0]).slice(1, 3);
    const [primary, secondary] = stackFields;

    // config X scale and axis
    const xScale = d3
      .scaleBand()
      .domain(data.map(xValue))
      .range([0, innerWidth])
      .padding(0.3);

    const xAxis = d3.axisBottom(xScale);

    // config Y scale and axis
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, yValue)])
      .range([innerHeight, 0])
      .nice();

    const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth);

    // set color scheme
    const colors = d3.scaleOrdinal(d3.schemePaired);

    // append graph body & move according to margin
    const body = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // add groups for Axes
    const yAxisG = body
      .append("g")
      .attr("class", "y axis")
      .attr("z-index", 0)
      .call(yAxis);
    yAxisG.selectAll(".domain").remove();

    const xAxisG = body
      .append("g")
      .call(xAxis)
      .attr("class", "x axis")
      .attr("z-index", 0)
      .attr("transform", `translate(0, ${innerHeight})`);
    xAxisG.select(".domain").remove();

    // Stack Generator
    const stack = d3
      .stack()
      .keys(stackFields)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    const series = stack(data);

    // append special g just for bars + series in graph
    const graph = body.append("g");

    // add groups for each row
    const groupings = graph
      .selectAll("g")
      .data(series)
      .enter()
      .append("g")
      .attr("class", "grouping")
      .style("fill", (d, i) => d3.schemePaired[i + iteration]);

    // add bars across row
    groupings
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("y", d => {
        return yScale(d[1]);
      })
      .attr("x", (d, i) => {
        return xScale(d.data.word);
      })
      .attr("width", d => xScale.bandwidth())
      .attr("height", d => yScale(d[0]) - yScale(d[1]));

    // append title
    body
      .append("text")
      .text(`${primary} vs. ${secondary}`)
      .attr("class", "title")
      .attr("y", -10);

    // append X Axis label
    xAxisG
      .append("text")
      .attr("y", 50)
      .attr("x", innerWidth / 2)
      .attr("fill", "black")
      .attr("class", "x axis-label")
      .text(xAxisLabel);

    // append Y axis label
    yAxisG
      .append("text")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "black")
      .attr("class", "y axis-label")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text(yAxisLabel);

    // append legends
    const legend = body
      .selectAll(".legend")
      .data(stackFields)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
      })
      .style("font", "10px sans-serif");

    legend
      .append("rect")
      // .attr("x", innerWidth + 18)
      .attr("x", innerWidth - 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d, i) => d3.schemePaired[i + iteration]);

    legend
      .append("text")
      // .attr("x", innerWidth + 44)
      .attr("x", innerWidth - 25)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(d => {
        return d;
      });
  }

  d3.csv(file).then(async data => {
    /*
      word
      uses_in_*primary*, // numeric
      uses_in_*secondary*, // numeric
      total_uses // numeric
    */
    data = data.slice(0, 15);
    const numericHeadings = Object.keys(data[0]).slice(1); // cut out 'word'
    data.forEach(d => {
      numericHeadings.forEach(heading => {
        d[heading] = +d[heading];
      });
    });
    await render(data);
  });
}
