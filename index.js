let svgWidth = 1200
let svgHeight = 500
var centered;

var date = Date.now();

let projection = d3.geoMercator()
    .scale(svgWidth)    
    .rotate([-120, 0])
    .translate([svgWidth / 2, svgHeight / 2]);
let pathGenerator = d3.geoPath().projection(projection)

let svg = d3.select('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

var g = svg.append('g')

svg.call(d3.zoom().on('zoom', function(){
    g.attr('transform',d3.event.transform)
}))



d3.queue().defer(d3.json,'/indonesia-atlas/provinsi/provinces-simplified-topo.json')
.defer(d3.json,'temp.json')
.defer(d3.json,'file wilayah/0.json')
.defer(d3.json,'diff_percentage.json')
.awaitAll(function(error, data){
    vis1(data)
    vis2(data)
    drawBarChart(data)
})

function vis1(data){
    d3.select("li.vis1").on("click", function(){
        d3.select("li.vis1").classed('selected',true)
        d3.select("li.vis2").classed('selected',false)
        d3.selectAll('circle').remove()
        let provinces = topojson.feature(data[0], data[0].objects.provinces)
        //store koordinat
        provinceCoor = {}

        provinces.features.forEach(function(d){
            provinceCoor[d.properties.provinsi.toLowerCase()] = projection(d3.geoCentroid(d))
        })
        
        g.selectAll('path').data(provinces.features)
            .enter()
            .append('path')
            .attr('d', pathGenerator)
            .attr('class', 'provinsi')
            .attr('id', function(d){
                return d.properties.provinsi.split(" ").join("").toUpperCase()
            })

        incrementx = {}
        incrementy = {}

        for (const prov in data[2]){
            incrementx[prov] = 0
            incrementy[prov] = 0
        }
        data[3].data.forEach(function(dDiff){
            for (const prov in data[2]){
                if (prov == dDiff[12].split('/')[0]){
                    drawCircle(dDiff,provinceCoor,incrementx,incrementy,data,prov)
                          
                }
            }
        })

        renderLegend()
    
        dataSelect = ['all','kel','kec']
        d3.selectAll('select').remove()
        d3.select('.selectClass').append('select').attr('id','selectButton')
        d3.select("select").selectAll('option').data(dataSelect)
            .enter()
            .append('option')
            .attr('value', function(d){
                return d
            })
            .text(function(d){
                return d
            })
            .attr('selected',function(d){
                if (d == "all"){
                    return "selected"
                }
            })
        d3.select("select").on("change", function(d){
            d3.selectAll('circle').remove()
            for (const prov in data[2]){
                incrementx[prov] = 0
                incrementy[prov] = 0
            }
            data[3].data.forEach(function(dDiff){
                for (const prov in data[2]){
                    if (prov == dDiff[12].split('/')[0]){
                        // console.log(provinceCoor[data[2][prov].nama.toLowerCase()])
                        if (d3.select("select").property("value")== "all"){
                            drawCircle(dDiff,provinceCoor,incrementx,incrementy,data,prov)
                        }else{
                            if (dDiff[1] == d3.select("select").property("value")){
                                
                                drawCircle(dDiff,provinceCoor,incrementx,incrementy,data,prov)
                            }
                        }          
                    }
                }
            })
            renderLegend()
        })

    })
}

function renderLegend(){
    g.selectAll(".legend").remove()
    
    const colorScale = d3.scaleOrdinal()
    .domain(['Gap paslon 1 positif','Gap paslon 2 positif'])
    .range(['red','blue'])
    g.selectAll("mydots")
        .data(colorScale.domain())
        .enter()
        .append("circle")
            .attr('class', 'legend')
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 450 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .style("fill", function(d){ return colorScale(d)})
    g.selectAll("mylabels")
        .data(colorScale.domain())
        .enter()
        .append("text")
            .attr('class','legend')
            .attr("x", 120)
            .attr("y", function(d,i){ return 450 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return colorScale(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
}

function renderLegend2(){
    g.selectAll(".legend").remove()
    
    const colorScale = d3.scaleOrdinal()
    .domain(['Selisih vote pada parent positif, pada child negatif','Selisih vote pada parent negatif, pada child positif'])
    .range(['red','blue'])
    g.selectAll("mydots")
        .data(colorScale.domain())
        .enter()
        .append("circle")
            .attr('class', 'legend')
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 450 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .style("fill", function(d){ return colorScale(d)})
    g.selectAll("mylabels")
        .data(colorScale.domain())
        .enter()
        .append("text")
            .attr('class','legend')
            .attr("x", 120)
            .attr("y", function(d,i){ return 450 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return colorScale(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
}
function vis2(data){
    
    d3.select("li.vis2").on("click", function(){
        d3.select("li.vis2").classed('selected',true)
        d3.select("li.vis1").classed('selected',false)
        d3.selectAll('circle').remove()
        let provinces = topojson.feature(data[0], data[0].objects.provinces)
        //store koordinat
        provinceCoor = {}

        provinces.features.forEach(function(d){
            provinceCoor[d.properties.provinsi.toLowerCase()] = projection(d3.geoCentroid(d))
        })
        g.selectAll('path').data(provinces.features)
            .enter()
            .append('path')
            .attr('d', pathGenerator)
            .attr('class', 'provinsi')
            .attr('id', function(d){
                return d.properties.provinsi.split(" ").join("").toUpperCase()
            })

        incrementx = {}
        incrementy = {}

        for (const prov in data[2]){
            incrementx[prov] = 0
            incrementy[prov] = 0
        }
        data[1].data.forEach(function(dDiff){
            for (const prov in data[2]){
                if (prov == dDiff[12].split('/')[0]){
                    drawCircle(dDiff,provinceCoor,incrementx,incrementy,data,prov)
                          
                }
            }
        })
        
        renderLegend2()
        dataSelect = ['all','kel','kec']
        d3.selectAll('select').remove()
        d3.select('.selectClass').append('select').attr('id','selectButton')
        d3.select("select").selectAll('option').data(dataSelect)
            .enter()
            .append('option')
            .attr('value', function(d){
                return d
            })
            .text(function(d){
                return d
            })
            .attr('selected',function(d){
                if (d == "all"){
                    return "selected"
                }
            })
        d3.select("select").on("change", function(d){
            d3.selectAll('circle').remove()
            for (const prov in data[2]){
                incrementx[prov] = 0
                incrementy[prov] = 0
            }
            data[1].data.forEach(function(dDiff){
                for (const prov in data[2]){
                    if (prov == dDiff[12].split('/')[0]){
                        // console.log(provinceCoor[data[2][prov].nama.toLowerCase()])
                        if (d3.select("select").property("value")== "all"){
                            drawCircle(dDiff,provinceCoor,incrementx,incrementy,data,prov)
                        }else{
                            if (dDiff[1] == d3.select("select").property("value")){
                                
                                drawCircle(dDiff,provinceCoor,incrementx,incrementy,data,prov)
                            }
                        }          
                    }
                }
            })
            renderLegend2()
        })
    })
}

function drawCircle(d,provinceCoor,incrementx,incrementy,data,prov){
    if (d[9] >= 0){
        g.append('circle')
            .attr('class', 'circle-diff-percentage-1')
            .attr('cx', provinceCoor[data[2][prov].nama.toLowerCase()][0] + incrementx[prov])
            .attr('cy', provinceCoor[data[2][prov].nama.toLowerCase()][1] + incrementy[prov])
            .attr('r', 5)
            .append('title').text(data[2][prov].nama.toLowerCase())

            incrementx[prov] = incrementx[prov] + Math.floor(Math.random() * 24) -12
            incrementy[prov] = incrementy[prov] + Math.floor(Math.random() * 6) -3
    }else{
        g.append('circle')
            .attr('class', 'circle-diff-percentage-2')
            .attr('cx', provinceCoor[data[2][prov].nama.toLowerCase()][0] + incrementx[prov])
            .attr('cy', provinceCoor[data[2][prov].nama.toLowerCase()][1] + incrementy[prov])
            .attr('r', 5)
            .append('title').text(data[2][prov].nama.toLowerCase())

            incrementx[prov] = incrementx[prov] + Math.floor(Math.random() * 24) -12
            incrementy[prov] = incrementy[prov] + Math.floor(Math.random() * 6) -3
    }
}

function drawBarChart(data){
    let dataBar = []
    let provCount = {}

    for (const prov in data[2]){
        provCount[data[2][prov].nama.toLowerCase()] = 0
    }
    data[3].data.forEach(function(d){
        for (const prov in data[2]){
            if (prov == d[12].split('/')[0]){
                provCount[data[2][prov].nama.toLowerCase()] ++
            }
        }
    })
    for (const prov in data[2]){
        if (provCount[data[2][prov].nama.toLowerCase()] != 0){
            var barDat = { prov : data[2][prov].nama.toLowerCase(), count : provCount[data[2][prov].nama.toLowerCase()] }
            dataBar.push(barDat)
        }
    }

    var margin = {left : 100, top : 400, right: 0, bottom:0}
    barWidth = svgWidth - margin.left - margin.right
    barHeight = svgHeight - margin.top - margin.bottom

    const xScale = d3.scaleBand()
    .domain(dataBar.map(d=>d.prov)).padding(0.4)
    .range([0,barWidth])
    

    const yScale = d3.scaleLinear()
    .domain([0,d3.max(dataBar,d=>d.count)])
    .range([barHeight/3,0])

    g.selectAll('rect').data(dataBar)
    .enter()
    .append('rect')
    .attr('class', 'bar-chart')
    .attr('id', d => "bar-" +   d.prov)
    .attr('transform',`translate(${margin.left},${margin.top})`)
    .attr('x', d => xScale(d.prov))
    .attr('y', d=>yScale(d.count))
    .attr('width', xScale.bandwidth() / 4)
    .attr('height',d => barHeight/3 - yScale(d.count))
    
}