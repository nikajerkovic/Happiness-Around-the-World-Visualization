async function crtajMapu() {

  const oblikDrzava = await d3.json('world-geojson.json')

  const imeDrzaveAccessor = d => d.properties["NAME"]
  const idDrzaveAccessor = d => d.properties["ADM0_A3_IS"]

  const dataset = await d3.csv("world_happiness_report_2017.csv")

  
  let dimenzije = {
    sirina: window.innerWidth * 0.9,
    margine: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  }
  
  dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
  
  const sfera = ({type: "Sphere"})

  const projekcija = d3.geoEqualEarth()
  .fitWidth(dimenzije.grSirina, sfera)   

  const putanjaGenerator = d3.geoPath(projekcija)

  const [[x0, y0], [x1, y1]] = putanjaGenerator.bounds(sfera)
  
  dimenzije.grVisina = y1;

  dimenzije.visina = dimenzije.grVisina 
    + dimenzije.margine.top + dimenzije.margine.bottom

  const okvir = d3.select("#okvir")
    .append("svg")
    .attr("width", dimenzije.sirina)
    .attr("height", dimenzije.visina)
  
  const granice = okvir.append("g")
    .style("transform", 
    `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`
    )

  

  const skalaBoja = d3.scaleThreshold()
    .domain([3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5])
    .range(["#116259", "#168376", "#1ca494", "#49b6a9", "#77c8bf","#fed5a6", "#fdc17a", "#fdac4d", "#fc9721", "#e3881e", "#b06a17"]);


  const zemlja = granice.append("path")
    .attr("class", "zemlja")
    .attr("d", putanjaGenerator(sfera))
  
  const mrezaJson = d3.geoGraticule10()
  
  const mreza = granice.append("path")
    .attr("class", "mreza")
    .attr("d", putanjaGenerator(mrezaJson))


  // defaultni dataset
  recolorMap(dataset)

 //slider
 
const slider = d3.select("#year-slider")
  .on("input", function() {
    updateMap(Number(this.value));
  });

function updateMap(year) {
  const yearSpan = document.getElementById("selected-year");
  yearSpan.innerText = `Year ${year}`
  fetch(`world_happiness_report_${year}.csv`)
  .then(response => response.text())
  .then(data => d3.csvParse(data))
  .then(recolorMap);

}


function recolorMap(data) {
    // Extract the happiness data from the data object
    console.log(data)
    const Format = d3.format(".2f")
    granice.selectAll(".drzava").remove()
    let happiness = data;
    // Create an object to store the happiness data by country
    let metrikaPoDrzavi = {}
     let rankPoDrzavi = {}
    let GDPPoDrzavi = {}
    let soc_support = {}
    let health = {}
    let freedom = {}
    let trust = {}
    let generosity = {}

    happiness.forEach(d => {
        metrikaPoDrzavi[d["Country"]] = Number(d["Happiness_Score"])
        rankPoDrzavi[d["Country"]] = Number(d["Happiness_Rank"])
        GDPPoDrzavi[d["Country"]] = Number(d["GDP_per_Capita"])
        soc_support[d["Country"]] = Number(d["Social_support"])
        health[d["Country"]] = Number(d["Healthy_Life_Expectancy"])
        freedom[d["Country"]] = Number(d["Freedom"])
        trust[d["Country"]] = Number(d["Trust"])
        generosity[d["Country"]] = Number(d["Generosity"])
    });
    console.log(metrikaPoDrzavi)
    // Select all the countries and update their fill colors
    const drzave = granice.selectAll(".drzava")
      .data(oblikDrzava.features)
      .enter().append("path")
        .attr("class", "drzava")
        .attr("d", putanjaGenerator)
        .attr("fill", d => {
          const vr = metrikaPoDrzavi[imeDrzaveAccessor(d)]
          if (typeof vr == "undefined") return "#e3e6e9"
          return skalaBoja(vr)
        })

    drzave
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)
  

    let detalji = d3.select("#detalji")
                  .attr("class", "detalji")


    detalji.append("div")
          .attr("class", "happiness-score")

    detalji.append("div")
          .attr("class", "happiness-rank")

    detalji.append("div")
          .attr("class", "gdp-per-capita")

    detalji.append("div")
          .attr("class", "social-support")

    detalji.append("div")
          .attr("class", "life-expectancy")

    detalji.append("div")
          .attr("class", "freedom")

    detalji.append("div")
          .attr("class", "generosity")

    detalji.append("div")
          .attr("class", "trust")


    
    function onMouseEnter(e,d){
      detalji.style("opacity", 0.85)
            
              
      detalji.select("#drzava")
        .text(imeDrzaveAccessor(d))

      detalji.selectAll("div")
    
      const vrijednost = metrikaPoDrzavi[imeDrzaveAccessor(d)]
      const rank = rankPoDrzavi[imeDrzaveAccessor(d)]
      const gdp = GDPPoDrzavi[imeDrzaveAccessor(d)]
      const support = soc_support[imeDrzaveAccessor(d)]
      const healthy = health[imeDrzaveAccessor(d)]
      const freedom_of_choice = freedom[imeDrzaveAccessor(d)]
      const trusty = trust[imeDrzaveAccessor(d)]
      const gene = generosity[imeDrzaveAccessor(d)]


      detalji.select(".happiness-score")
        .text(`Happiness score: ${Format(vrijednost || 0)}`)

      detalji.select(".happiness-rank")
        .text(`Happiness rank: ${rank || 0}`)

      detalji.select(".gdp-per-capita")
        .text(`GDP per capita: ${Format(gdp || 0)}`)

      detalji.select(".social-support")
        .text(`Social support: ${Format(support || 0)}`)

      detalji.select(".life-expectancy")
        .text(`Healthy life expectancy: ${Format(healthy || 0)}`)

      detalji.select(".freedom")
        .text(`Freedom of choice: ${Format(freedom_of_choice  || 0)}`)

      detalji.select(".trust")
        .text(`Trust: ${Format(trusty  || 0)}`)

      detalji.select(".generosity")
        .text(`Generosity: ${Format(gene  || 0)}`)


      const [centerX, centerY] = putanjaGenerator.centroid(d)

      detalji.style("transform", `translate(
        calc(-50% + ${centerX + dimenzije.margine.left}px),
        calc(-100% + ${centerY + dimenzije.margine.top}px)
        )`)

      }

    function onMouseLeave(){
        detalji.style("opacity", 0)
        d3.selectAll(".kruzic").remove()
      }
    

}

  

const ticks = d3.scaleLinear()
    .domain([2.5, 8])
    .range([0, 280]);

const xAxis = d3.axisBottom(ticks)
    .tickSize(10)
    .tickValues(skalaBoja.domain());

const legend = okvir.append("g")
  .attr("class", "color-legend")
  .attr("transform", `translate(90,${
        dimenzije.sirina < 800
        ? dimenzije.grVisina -30
        : dimenzije.grVisina * 0.75
      })`)
  .call(xAxis);

legend.select(".domain")
    .remove();

const legendColors = function(legendColor) {
  let d = skalaBoja.invertExtent(legendColor);
  if (!d[0]) d[0] = ticks.domain()[0];
  if (!d[1]) d[1] = ticks.domain()[1];
  return d;
};

legend.selectAll("rect")
  .data(skalaBoja.range().map(legendColor => legendColors(legendColor)))
  .enter().insert("rect", ".legend-tick")
  .attr("height", 10)
  .attr("x", d => ticks(d[0]))
  .attr("width", d => ticks(d[1]) - ticks(d[0]))
  .attr("fill",  d =>  skalaBoja(d[0]));

legend.append("text")
    .attr("class", "legend-title")
    .attr("fill", "#26272B")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .attr("x", 0)
    .attr("y", -3)
    .text("Happiness Score");


}
crtajMapu()