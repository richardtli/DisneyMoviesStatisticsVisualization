let data;

fetch("data/disneyMovies.json")
  .then((response) => response.json())
  .then((json) => {
    data = json;
    main();
  })
  .catch((error) => console.error("Error loading JSON:", error));

function main() {
  const labelColor = "#ff38f5";
  const backgroundColor = "#100e2b";


  const container = document.querySelector(".container");
  const body = document.body
  body.style.backgroundColor = backgroundColor
  const tooltip = d3.select(".tool-tip");

  const margin = {
    left: 30,
    right: 30,
    top: 90,
    bottom: 0,
  };
  const width = 928; // uncomment for responsive width
  const height = 500;

  const fullWidth = width + margin.left + margin.right;
  const fullHeight = height + margin.top + margin.bottom;

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, fullWidth, fullHeight])
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%") // fill width if it fits
    .style("height", "100%") // fill height if it fits
    .style("max-width", "98vw") // don't go beyond screen width
    .style("max-height", "99vh") // don't go beyond screen height


  const defs = svg.append("defs");

  const pattern = defs
    .append("pattern")
    .attr("id", "imgpattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .append("image")
    .attr("href", "")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .attr("preserveAspectRatio", "xMidYMid slice");


  const glow = defs
    .append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  glow
    .append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 2) 
    .attr("result", "blurred");

  const feMerge = glow.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "blurred");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");


    const dataBackground = svg
    .append("g")

  dataBackground
    .append("rect")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .style("fill", backgroundColor);

  const poster = svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .attr("fill", "url(#imgpattern)")
    .classed("poster", true);

    



  const x = d3
    .scaleBand()
    .domain(data.map((d, i) => i))
    .rangeRound([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.boxOffice)])
    .range([height - margin.bottom, margin.top]);

    const xAxis = d3
    .axisBottom(x)
    .tickValues(d3.range(data.length)) // tick at each integer index
    .tickFormat((d, i) => "");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .call((g) => {
      // Tick lines to white

      g.selectAll(".tick line").attr("stroke", "none");

      // Tick labels to white
      g.selectAll(".tick text").attr("fill", labelColor);

      // If you want the domain line white too
      g.select(".domain").attr("stroke", labelColor);
    });

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickFormat((y) => y.toFixed())
        .tickSizeOuter(100)
        .tickSizeInner(-width) // or whatever the width of your chart is
        .tickSizeOuter(0)
    )
    .call((g) => {
      g.selectAll(".tick line").attr("transform", "translate(15)");
      g.selectAll(".tick line").attr("stroke-width", 0.5);
      g.selectAll(".tick line").attr("stroke", labelColor + "55"); // make tick lines white
      g.selectAll(".tick text").attr("fill", labelColor);
      g.select(".domain").remove();
    });



  svg
    .append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("x", (d, i) => {
      return x(i);
    })
    .attr("y", (d) => y(d.boxOffice))
    .attr("height", (d) => y(0) - y(d.boxOffice))
    .attr("width", x.bandwidth())
    .attr("fill", (d) => d.neonColor)
    .attr("stroke", "none")
    .attr("stroke-width", 0)
    .style("cursor", "pointer")
    .style("filter", "url(#glow)")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "white").attr("stroke-width", 1);
      pattern.attr("href", `posters/${d.posterFile}`);
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${
            d.title
          }</strong><br/>Box Office: $${d.boxOffice.toLocaleString()} million`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("background-color", d.neonColor);
      if(d.boxOffice >= 1000){
        tooltip.html(
          `<strong>${
            d.title
          }</strong><br/>Box Office: $${(d.boxOffice / 1000).toLocaleString()} billion`
        )
      }  
    })

    .on("mousemove", function (event, d) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("stroke", "none").attr("stroke-width", 0);
      pattern.attr("href", "");
      tooltip.style("opacity", 0);
    })
    .append("title")
  container.append(svg.node());
}
