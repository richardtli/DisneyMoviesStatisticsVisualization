let data;

fetch("data/disneyMovies.json")
  .then((response) => response.json())
  .then((json) => {
    data = json;
    main();
  })
  .catch((error) => console.error("Error loading JSON:", error));

function main() {
  const container = document.querySelector(".container");
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
  const aspectRatio = fullWidth / fullHeight;

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, fullWidth, fullHeight])
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%") // fill width if it fits
    .style("height", "100%") // fill height if it fits
    .style("max-width", "98vw") // don't go beyond screen width
    .style("max-height", "98vh") // don't go beyond screen height
    .style("margin", "auto") // optional centering
    .style("display", "block")
    .style("border", "1px dotted #000");

  const defs = svg.append("defs");

  const pattern = defs
    .append("pattern")
    .attr("id", "imgpattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .append("image")
    .attr("href", "posters/frozen.jpeg") // <-- set the actual image URL here
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .attr("preserveAspectRatio", "xMidYMid slice");

  const poster = svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", fullWidth)
    .attr("height", fullHeight)
    .attr("fill", "url(#imgpattern)")
    .classed("poster", true);

  const dataBackground = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  dataBackground
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none");

  const x = d3
    .scaleBand()
    .domain(data.map((d, i) => i))
    .rangeRound([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.boxOffice)])
    .range([height - margin.bottom, margin.top]);

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
    .attr("fill", (d) => d.color)
    .attr("stroke", "none")
    .attr("stroke-width", 0)
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
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
        .style("background-color", d.color);
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
    .text((d) => d.title);

  const xAxis = d3
    .axisBottom(x)
    .tickValues("") // tick at each integer index
    .tickFormat((d, i) => data[i].title);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text") // select the tick labels
    .attr("transform", "rotate(-90)") // rotate them 90 degrees counter-clockwise
    .style("text-anchor", "end")
    .attr("dx", "-0.8em") // shift a little in x after rotation
    .attr("dy", "-0.5em")
    .style("font-family", "Roboto, sans-serif")
    .style("font-size", "12px");

//   svg
//     .append("g")
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(
//       d3
//         .axisLeft(y)
//         .tickFormat((y) => y.toFixed())
//         .tickSizeOuter(100)
//     )
//     .call((g) => g.select(".domain").remove())
//     .call((g) =>
//       g
//         .append("text")
//         .attr("x", -margin.left)
//         .attr("y", margin.top / 2)
//         .attr("fill", "currentColor")
//         .attr("text-anchor", "start")
//         .text("↑ Box Office")
//     );

  container.append(svg.node());
}
