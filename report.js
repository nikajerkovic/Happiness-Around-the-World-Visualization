async function crtajScatter(metrics) {
  
  const dataset = await d3.csv("world_happiness_report_2015.csv")

  console.log(metrics)

  const xAccessor = data=> data[metrics]
  const yAccessor = data => data.Happiness_Score

  let dimenzije = {
    sirina: window.innerWidth *0.9,
    visina: window.innerHeight * 0.9,
    margine: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
    dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom

  // 3. Crtanje canvasa
  let okvir = d3.select("#okvir").select("svg");
  if(okvir.empty()){
    okvir = d3.select("#okvir")
      .append("svg")
        .attr("width", dimenzije.sirina)
        .attr("height", dimenzije.visina)
  }

  let granice = okvir.select("g");
  if(granice.empty()){
    granice = okvir.append("g")
    .style("transform", `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`);
  }

  // 4. Definiranje razmjera

  const xSkala = d3.scaleLinear()
    // za podatke
    .domain(d3.extent(dataset, xAccessor))
    // za piksele
    .range([0, dimenzije.grSirina])
    .nice()

  const ySkala = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimenzije.grVisina, 0])
    .nice()

  const colors= d3.scaleOrdinal()
    .domain(["Western Europe","Central and Eastern Europe" ,"North America","Latin America and Caribbean", "Australia and New Zealand","Southeastern Asia","Southern Asia","Eastern Asia","Sub-Saharan Africa","Middle East and Northern Africa"])
    .range(["#f95c25", "#fb9424", "#1ca494","#99d5cd","#081d40", "#680099","#fc99ff", "#e7b3ff","#25b8da","#177085"])
  
  // 5. Crtanje podataka
  const tocke = granice.selectAll("circle")
    .data(dataset)
    .join("circle")
    .attr("cx", dp => xSkala(xAccessor(dp)))
    .attr("cy", dp => ySkala(yAccessor(dp)))
    .attr("r", 5)
    .attr("fill",  function (d) {
      return colors(d["Region"]);
    })
    .append("title")
    

  // 6. Crtanje pomocne grafike
  const xOsGenerator = d3.axisBottom()
    .scale(xSkala)

  let xOs = granice.select(".x-os");
  if(xOs.empty()){
    xOs = granice.append("g")
    .attr("class","x-os")
  }
  xOs.call(xOsGenerator)
    .style("transform", `translateY(${dimenzije.grVisina}px)`)

  let xOsOznaka = xOs.select(".x-os-oznaka");
  if(xOsOznaka.empty()){
    xOsOznaka = xOs.append("text")
    .attr("class", "x-os-oznaka")
  }
  xOsOznaka
      .attr("x", dimenzije.grSirina / 2)
      .attr("y", dimenzije.margine.bottom / 2 + 20)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(metrics.replaceAll("_"," "))

  // 7. Crtanje y-os
  const yOsGenerator = d3.axisLeft()
    .scale(ySkala)

  let yOs = granice.select(".y-os");
  if(yOs.empty()){
    yOs = granice.append("g")
    .attr("class","y-os")
  }
  yOs.call(yOsGenerator)

  let yOsOznaka = yOs.select(".y-os-oznaka");
  if(yOsOznaka.empty()){
    yOsOznaka = yOs.append("text")
    .attr("class", "y-os-oznaka")
  }
  yOsOznaka
    .attr("x", -dimenzije.grVisina / 2)
    .attr("y", -dimenzije.margine.left / 2 -15)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Happiness Score")

// 7. Crtanje legende

var width = 300;
var height = 200;

var legendData = [
  {name:"Western Europe",color:"#f95c25"},
  {name:"Central and Eastern Europe",color:"#fb9424"},
  {name:"North America",color:"#1ca494"},
  {name:"Latin America and Caribbean",color:"#99d5cd"},
  {name:"Australia and New Zealand",color:"#081d40"},
  {name:"Southeastern Asia",color:"#680099"},
  {name:"Southern Asia",color:"#fc99ff"},
  {name:"Eastern Asia",color:"#e7b3ff"},
  {name:"Sub-Saharan Africa",color:"#25b8da"},
  {name:"Middle East and Northern Africa",color:"#177085"}

]


var legend = okvir.append("g")

legend.selectAll('g')
  .data(legendData)
  .enter()
  .append('g')
  .each(function(d, i) {
        var g = d3.select(this);
        g.append("rect")
         .attr("x", width + dimenzije.sirina-520)
         .attr("y", i*16+448)
         .attr("width", 8)
         .attr("height", 8)
         .style("fill", d.color);
        g.append("text")
         .attr("x", width +dimenzije.sirina-500)
         .attr("y", i * 16 + 457)
         .attr("height", 20)
         .attr("width", 120)
         .style("fill", d.color)
         .text(d.name);

      });


  // 7. Dodavanje interakcija
  granice.selectAll("circle")
  .on("mouseenter", onMouseEnter)
  .on("mouseleave", onMouseLeave)

  const detalji = d3.select("#detalji")
  const Format = d3.format(".2f")

  
  // moramo maknit voronoi od prije jer ako ne maknemo ostane uvik gdp koji je prvi 
  d3.selectAll('.voronoi').remove() 
  const delaunay = d3.Delaunay.from(dataset, d => xSkala(xAccessor(d)), d => ySkala(yAccessor(d)));
  const voronoi = delaunay.voronoi([0, 0, dimenzije.grSirina, dimenzije.grVisina])
  	

  granice.selectAll(".voronoi")
  .data(dataset)
  .enter().append("path")
    .attr("class", "voronoi")
    .attr("d", (d, i) => voronoi.renderCell(i))
    .attr("stroke", "transparent")
  .on("mouseenter", onMouseEnter)
  .on("mouseleave", onMouseLeave)

  
 function onMouseEnter(e, d){
    const novaTocka = granice.append("circle")
    .attr("class", "detaljiTocka")
    .attr("cx", xSkala(xAccessor(d)))
    .attr("cy", ySkala(yAccessor(d)))
    .attr("r", 7)
    .style("fill", "black")
    .style("pointer-events", "none")
    detalji.select("#happiness")
        .text(`Happiness Score: ${Format(yAccessor(d))}`) 
    detalji.select("#metrics")
        .text(`${metrics.replaceAll("_"," ")}: ${Format(d[metrics])}`)
    detalji.select("#drzava")
        .text(d.Country)

    const x = xSkala(xAccessor(d))+ dimenzije.margine.left
    const y = ySkala(yAccessor(d))+ dimenzije.margine.top
    detalji.style("transform", 
        `translate(
          calc(-50% + ${x}px), 
          calc(${y}px)
        )`)
    detalji.style("opacity", 0.85)
  }


  function onMouseLeave(){
    detalji.style("opacity", 0)
    d3.selectAll(".detaljiTocka").remove()
  }



}

const buttons = d3.selectAll(".header__btn-group")

// set the first button as the default selected button
const defaultButton = buttons.nodes()[0]
d3.select(defaultButton).classed("active", true)
crtajScatter(defaultButton.getAttribute("data-metric"))

buttons.on("click", function() {
  // remove the active class from all buttons
  buttons.classed("active", false)
  // add the active class to the clicked button
  d3.select(this).classed("active", true)
  const selectedMetric = d3.select(this).attr("data-metric")
  crtajScatter(selectedMetric)
});



