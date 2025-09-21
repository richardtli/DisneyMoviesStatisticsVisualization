let data

fetch('data/disneyMovies.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    main()
  })
  .catch(error => console.error('Error loading JSON:', error));


function main(){
    const container = document.querySelector('.container')
    console.log(data)

    const margin = {
        left: 30,
        right: 30,
        top: 30,
        bottom: 30
    };
    const width = 928; // uncomment for responsive width
    const height = 500;

    const svg = d3
        .create("svg")
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "max-width: 100%; height: auto")
        .style("border", "1px dotted #000");

    const defs = svg.append("defs");

    const pattern = defs.append("pattern")
    .attr("id", "imgpattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", width)
    .attr("height", height)
    .append("image")
    
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMidYMid slice");

    const dataBackground = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    dataBackground
        .append("rect")
        .classed("bar-area", true)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "url(#imgpattern)");

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
        pattern.attr("xlink:href", "posters/frozen.jpeg")  // local image path here
        test = d.title;
        })
        .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "none").attr("stroke-width", 0);
        pattern.attr("xlink:href", "")
        test = "";
        })
        .append("title")
        .text((d) => d.title);

    const xAxis = d3
        .axisBottom(x)
        .tickValues(d3.range(data.length)) // tick at each integer index
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

    svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
        d3
            .axisLeft(y)
            .tickFormat((y) => y.toFixed())
            .tickSizeOuter(100)
        )
        .call((g) => g.select(".domain").remove())
        .call((g) =>
        g
            .append("text")
            .attr("x", -margin.left)
            .attr("y", margin.top / 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Box Office"))

    container.append(svg.node());
}