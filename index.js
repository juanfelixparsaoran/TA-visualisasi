let svgWidth = 1200
let svgHeight = 1000
var centered;

var date = Date.now();

let projection = d3.geoMercator()
    .scale(svgWidth)    
    .rotate([-120, 0])
    .translate([svgWidth / 2, svgHeight / 5]);
let pathGenerator = d3.geoPath().projection(projection)

let baseKota = '/indonesia-atlas/kabupaten-kota'

let svg = d3.select('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

svg.append("rect")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .on("click", clicked);

var g = svg.append('g')



svg.call(d3.zoom().on('zoom', function(){
    g.attr('transform',d3.event.transform)
}))



d3.queue().defer(d3.json,'/indonesia-atlas/provinsi/provinces-simplified-topo.json')
.defer(d3.json,'temp.json')
.defer(d3.json,'file wilayah/0.json')
.defer(d3.json,'diff_percentage.json')
.awaitAll(function(error, data){
    vis3(data)
    vis1(data)
    vis2(data)
})

function drawIndonesia(){
    d3.selectAll('svg#subunits path').style('pointer-events' , 'auto')
    let tooltip = d3.select('body')
    .append("div")
    .attr('class', 'tooltip-province')
    .style("position", "fixed")
    .style("z-index", 1)
    .style("visibility", "hidden");;
    var dataRekap;
    d3.json("https://kawal-c1.appspot.com/api/c/0?"+date+"/", function(data1){
        dataRekap = data1
    })
    d3.json('/indonesia-atlas/provinsi/provinces-simplified-topo.json', function(data){
        
        let provinces = topojson.feature(data, data.objects.provinces)
        g.append('svg')
            .attr("preserveAspectRatio", "xMinYMin")
            .attr('id', 'subunits')
            .selectAll('path')
            .data(provinces.features)
            .enter()
            .append('path')
            .attr('d', pathGenerator)
            .attr('class', function(d){
                coloringProvince(d)
            })
            .attr('id', function(d){
                return d.properties.provinsi.split(" ").join("")
            })
            .on('click', clicked)
            .on('mouseover', function(d){
                
                if (d.properties.provinsi.includes("Jakarta")){
                    
                    d.properties.provinsi = "DKI Jakarta"
                }

                if (d.properties.provinsi.includes("Yogyakarta")){
                    
                    d.properties.provinsi = "DAERAH ISTIMEWA YOGYAKARTA"
                }
                var id = dataRekap.children.find(el => el[1] == d.properties.provinsi.toUpperCase())
                
                var persen1 = dataRekap.rekap[id[0]].pas1 * 100 / (dataRekap.rekap[id[0]].pas1 + dataRekap.rekap[id[0]].pas2)
                var persen2 = dataRekap.rekap[id[0]].pas2 * 100 / (dataRekap.rekap[id[0]].pas1 + dataRekap.rekap[id[0]].pas2)
                tooltip.html(`
                <div class="tooltip">
                    <p style="text-align: center; font-weight: bold; font-size: 14px; padding: 0 0 3px 0;">${d["properties"]["provinsi"].toUpperCase()}</p>
                    <div class="img-pas">
                    <img id="pas1img" src="/assets/img/jokowi_maruf.png"/>
                    <img id="pas2img" src="/assets/img/prabowo_sandi.png"/>
                    </div>
                    
                    <div class="persen">
                        <p><span style="color: #AC0B13;">${persen1.toFixed(2)}%</span> <span style="float: right; color: #597EA1;">${persen2.toFixed(2)}%</span></p>
                    </div>
                    <div class="pas">
                        <p><span style="font-size: 12px; font-weight: bold; float: left; color: #AC0B13;">(${dataRekap.rekap[id[0]].pas1})</span> 
                        <span style="font-size: 12px; font-weight: bold; float: right; color: #597EA1;">(${dataRekap.rekap[id[0]].pas2})</span></p><br/>
                    </div>
                    </div>
        
                </div>
                `)
                tooltip.style('visibility', 'visible')
                if (d.properties.provinsi.includes("DKI ")){
            
                    d.properties.provinsi = d.properties.provinsi.replace("DKI " ,"")
                }
                
                if (d.properties.provinsi.includes("DAERAH ISTIMEWA ")){
                
                    d.properties.provinsi = d.properties.provinsi.replace("DAERAH ISTIMEWA YOGYAKARTA" ,"Yogyakarta")
                }
                d3.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#89729E")
            })
            .on("mousemove", (d) => {
                tooltip.style("top", `${d3.event.clientY - 200}px`)
                        .style("left", `${d3.event.clientX - 140}px`);   
            })
            .on("mouseout", (d) => {
                tooltip.style("visibility", "hidden");
                d3.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", coloringProvince(d))
                
            })
        
        g.append('path')
            .datum(topojson.mesh(data, data.objects.provinces, function(a,b){ 
                return a!== b;
            }))
            .attr('id','state-borders')
            .attr('d', pathGenerator)
    })
}

let tooltip2 = d3.select('body')
    .append("div")
    .style("position", "fixed")
    .style("z-index", 1)
    .style("visibility", "hidden");

// fetch("https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json")

function mouseover2(d ,data2){
    var idKota = d.id
    data2.children.forEach(function(indexKota){
        if (indexKota[1].includes("KOTA ")){
            
            indexKota[1] = indexKota[1].replace("KOTA " ,"")
        }
        if (indexKota[1].split(" ").join("") == idKota.toUpperCase()){
            // console.log(data2)
            var persen1 = data2.rekap[indexKota[0]].pas1 * 100 / (data2.rekap[indexKota[0]].pas1 + data2.rekap[indexKota[0]].pas2)
            var persen2 = data2.rekap[indexKota[0]].pas2 * 100 / (data2.rekap[indexKota[0]].pas1 + data2.rekap[indexKota[0]].pas2)

            tooltip2.html(`
                <div class="tooltip">
                <p style="text-align: center; font-weight: bold; font-size: 16px; padding: 0 0 3px 0;">${indexKota[1].toUpperCase()}</p>
                <div class="img-pas">
                    <img id="pas1img" src="/assets/img/jokowi_maruf.png"/>
                    <img id="pas2img" src="/assets/img/prabowo_sandi.png"/>
                </div>
                <div class="persen">
                    <p><span style="color: #AC0B13;">${persen1.toFixed(2)}%</span> <span style="float: right; color: #597EA1;">${persen2.toFixed(2)}%</span></p>
                </div>
                <div class="pas">
                    <p><span style="font-size: 12px; font-weight: bold; float: left; color: #AC0B13;">(${data2.rekap[indexKota[0]].pas1})</span> 
                    <span style="font-size: 12px; font-weight: bold; float: right; color: #597EA1;">(${data2.rekap[indexKota[0]].pas2})</span></p>
                    </br>
                </div>
                </div>
            `)
            tooltip2.style('visibility', 'visible')
            
        }
    })
}

function mousemove2(){
    tooltip2.style("top", `${d3.event.clientY - 220}px`)
        .style("left", `${d3.event.clientX - 140}px`);    
}

function mouseout2(){
    tooltip2.style("visibility", "hidden");
}

function coloringCity(d,data2){
    data2.children.forEach(function(indexKota){
        
        if (indexKota[1].includes("KOTA ")){
            
            indexKota[1] = indexKota[1].replace("KOTA " ,"")
        }
        if (indexKota[1].split(" ").join("") == d.properties.kabkot.split(" ").join("").toUpperCase()){
            
            var persen1 = data2.rekap[indexKota[0]].pas1 * 100 / (data2.rekap[indexKota[0]].pas1 + data2.rekap[indexKota[0]].pas2)
            var persen2 = data2.rekap[indexKota[0]].pas2 * 100 / (data2.rekap[indexKota[0]].pas1 + data2.rekap[indexKota[0]].pas2)
            if (persen1 > persen2){  
                
                if (persen1 > 90){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#990000")
                }else if (persen1 > 80 && persen1 < 90){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#cc0000")
                }else if (persen1 > 70 && persen1 < 80){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#ff0000")
                }else if (persen1 > 60 && persen1 < 70){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#ff3333")
                }else if (persen1 > 50 && persen1 < 60){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#ff6666")
                }
            }else{
                if (persen2 > 90){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#000099")
                }else if (persen2 > 80 && persen2 < 90){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#0000cc")
                }else if (persen2 > 70 && persen2 < 80){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#0000ff")
                }else if (persen2 > 60 && persen1 < 70){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#3333ff")
                }else if (persen2 > 50 && persen2 < 60){
                    g.selectAll(`path#${d.properties.kabkot.split(" ").join("")}`).style("fill", "#6666ff")
                }
            }
        }
    })
}

function coloringProvince(d){
    d3.json("https://kawal-c1.appspot.com/api/c/0?"+date+"/",function(data2){
        data2.children.forEach(function(indexProvinsi){
            
            if (indexProvinsi[1].includes("DKI ")){
            
                indexProvinsi[1] = indexProvinsi[1].replace("DKI " ,"")
            }

            if (indexProvinsi[1].includes("DAERAH ISTIMEWA ")){
            
                indexProvinsi[1] = indexProvinsi[1].replace("DAERAH ISTIMEWA " ,"")
            }

            if (indexProvinsi[1].split(" ").join("") == d.properties.provinsi.split(" ").join("").toUpperCase()){
                var persen1 = data2.rekap[indexProvinsi[0]].pas1 * 100 / (data2.rekap[indexProvinsi[0]].pas1 + data2.rekap[indexProvinsi[0]].pas2)
                var persen2 = data2.rekap[indexProvinsi[0]].pas2 * 100 / (data2.rekap[indexProvinsi[0]].pas1 + data2.rekap[indexProvinsi[0]].pas2)
                if (persen1 > persen2){  
                    
                    if (persen1 > 90){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#990000")
                    }else if (persen1 > 80 && persen1 < 90){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#cc0000")
                    }else if (persen1 > 70 && persen1 < 80){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#ff0000")
                    }else if (persen1 > 60 && persen1 < 70){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#ff3333")
                    }else if (persen1 > 50 && persen1 < 60){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#ff6666")
                    }
                }else{
                    if (persen2 > 90){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#000099")
                    }else if (persen2 > 80 && persen2 < 90){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#0000cc")
                    }else if (persen2 > 70 && persen2 < 80){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#0000ff")
                    }else if (persen2 > 60 && persen1 < 70){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#3333ff")
                    }else if (persen2 > 50 && persen2 < 60){
                        g.selectAll(`path#${d.properties.provinsi.split(" ").join("")}`).style("fill", "#6666ff")
                    }
                }
            }
        })
    })
}

function clicked(d){
    var x,y,k;
    if(d){
        d3.select("#kota").remove();
        d3.select("#kota-borders").remove();
        
        
        document.getElementById('info').innerHTML = d.properties.provinsi.toUpperCase()

        var dataDaerah,rekapDaerah,dataKota,rekapKota = [];
        d3.json("https://kawal-c1.appspot.com/api/c/0?"+date+"/", function(data){
            
            dataDaerah = data
            dataDaerah.children.forEach(function(indexDaerah){
                if (indexDaerah[1].toUpperCase() == d.properties.provinsi.toUpperCase()){
                    d3.json("https://kawal-c1.appspot.com/api/c/"+indexDaerah[0]+"?"+date+"/",function(data2){
                        if (d.properties.provinsi == "Aceh"){
                            d3.json(baseKota + '/Aceh/aceh-simplified-topo.json',function(data){
                                
                                let kota = topojson.feature(data, data.objects.aceh)
                                
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects.aceh, function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                                
                            })
                        } else if (d.properties.provinsi == "Sumatera Utara"){
                            d3.json(baseKota + '/SumateraUtara/sumatera-utara-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sumatera-utara"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                    
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sumatera-utara"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Sumatera Barat"){
                            d3.json(baseKota + '/SumateraBarat/sumatera-barat-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sumatera-barat"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sumatera-barat"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Riau"){
                            d3.json(baseKota + '/Riau/riau-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["riau"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["riau"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Sumatera Selatan"){
                            d3.json(baseKota + '/SumateraSelatan/sumatera-selatan-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sumatera-selatan"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sumatera-selatan"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Jambi"){
                            d3.json(baseKota + '/Jambi/jambi-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["jambi"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["jambi"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Bengkulu"){
                            d3.json(baseKota + '/Bengkulu/bengkulu-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["bengkulu"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["bengkulu"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Lampung"){
                            d3.json(baseKota + '/Lampung/lampung-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["lampung"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["lampung"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Kepulauan Bangka Belitung"){
                            d3.json(baseKota + '/Babel/kepulauan-bangka-belitung-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kepulauan-bangka-belitung"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kepulauan-bangka-belitung"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "DKI Jakarta"){
                            d3.json(baseKota + '/Jakarta/jakarta-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["jakarta"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["jakarta"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                            d3.json(baseKota + '/Jakarta/kepulauan-seribu-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kepulauan-seribu"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kepulauan-seribu"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Kepulauan Riau"){
                            d3.json(baseKota + '/KepulauanRiau/kepulauan-riau-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kepulauan-riau"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kepulauan-riau"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Jawa Barat"){
                            d3.json(baseKota + '/JawaBarat/jawa-barat-simplified-topo.json',function(data){
                                
                                let kota = topojson.feature(data, data.objects["jawa-barat"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["jawa-barat"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Banten"){
                            d3.json(baseKota + '/Banten/banten-simplified-topo.json',function(data){
                                let kota = topojson.feature(data, data.objects["banten"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["banten"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Jawa Tengah"){
                            d3.json(baseKota + '/JawaTengah/jawa-tengah-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["jawa-tengah"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["jawa-tengah"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Jawa Timur"){
                            d3.json(baseKota + '/JawaTimur/jawa-timur-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["jawa-timur"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["jawa-timur"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        
                        } else if (d.properties.provinsi == "DAERAH ISTIMEWA YOGYAKARTA"){
                            d3.json(baseKota + '/Yogyakarta/yogyakarta-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["yogyakarta"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["yogyakarta"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        }  else if (d.properties.provinsi == "Bali"){
                            d3.json(baseKota + '/Bali/bali-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["bali"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["bali"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Nusa Tenggara Barat"){
                            d3.json(baseKota + '/NTB/nusa-tenggara-barat-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["nusa-tenggara-barat"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["nusa-tenggara-barat"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Nusa Tenggara Timur"){
                            d3.json(baseKota + '/NTT/nusa-tenggara-timur-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["nusa-tenggara-timur"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["nusa-tenggara-timur"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Kalimantan Barat"){
                            d3.json(baseKota + '/KalimantanBarat/kalimantan-barat-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kalimantan-barat"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kalimantan-barat"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Kalimantan Utara"){
                            d3.json(baseKota + '/KalimantanUtara/kalimantan-utara-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kalimantan-utara"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kalimantan-utara"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Kalimantan Timur"){
                            d3.json(baseKota + '/KalimantanTimur/kalimantan-timur-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kalimantan-timur"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kalimantan-timur"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        }
                        else if (d.properties.provinsi == "Kalimantan Tengah"){
                            d3.json(baseKota + '/KalimantanTengah/kalimantan-tengah-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kalimantan-tengah"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kalimantan-tengah"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Kalimantan Selatan"){
                            d3.json(baseKota + '/KalimantanSelatan/kalimantan-selatan-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["kalimantan-selatan"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["kalimantan-selatan"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Sulawesi Utara"){
                            d3.json(baseKota + '/SulawesiUtara/sulawesi-utara-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sulawesi-utara"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sulawesi-utara"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Sulawesi Barat"){
                            d3.json(baseKota + '/SulawesiBarat/sulawesi-barat-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sulawesi-barat"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sulawesi-barat"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Sulawesi Tenggara"){
                            d3.json(baseKota + '/SulawesiTenggara/sulawesi-tenggara-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sulawesi-tenggara"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sulawesi-tenggara"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Sulawesi Tengah"){
                            d3.json(baseKota + '/SulawesiTengah/sulawesi-tengah-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sulawesi-tengah"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sulawesi-tengah"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Sulawesi Selatan"){
                            d3.json(baseKota + '/SulawesiSelatan/sulawesi-selatan-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["sulawesi-selatan"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["sulawesi-selatan"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Gorontalo"){
                            d3.json(baseKota + '/Gorontalo/gorontalo-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["gorontalo"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["gorontalo"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Maluku"){
                            d3.json(baseKota + '/Maluku/maluku-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["maluku"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["maluku"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Maluku Utara"){
                            d3.json(baseKota + '/MalukuUtara/maluku-utara-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["maluku-utara"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["maluku-utara"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Papua"){
                            d3.json(baseKota + '/Papua/papua-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["papua"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["papua"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        } else if (d.properties.provinsi == "Papua Barat"){
                            d3.json(baseKota + '/PapuaBarat/papua-barat-simplified-topo.json',function(data){
                                 
                                let kota = topojson.feature(data, data.objects["papua-barat"])
                                g.append('svg')
                                    .attr('id', 'kota')
                                    .selectAll('path')
                                    .data(kota.features)
                                    .enter()
                                    .append('path')
                                    .attr('d', pathGenerator)
                                    .attr('id', function(d){
                                        return d.properties.kabkot.split(" ").join("")
                                    })
                                    .attr('class', function(d){
                                        coloringCity(d,data2)
                                    })
                                    .on('mouseover', function(){
                                        mouseover2(this, data2)
                                    })
                                    .on("mousemove", () => {
                                        mousemove2()
                                    })
                                    .on("mouseout", () => {
                                        mouseout2()
                                    })
                                g.append('path')
                                    .datum(topojson.mesh(data, data.objects["papua-barat"], function(a,b){ 
                                        return a!== b;
                                    }))
                                    .attr('id','kota-borders')
                                    .attr('d', pathGenerator)
                            })
                        }
                        
                    })
                }
            })
        })
    }else{
        
        document.getElementById('info').innerHTML = "INDONESIA";
        d3.select("#kota").remove();
        d3.select("#kota-borders").remove();
        g.selectAll('svg').remove();
        d3.selectAll('.tooltip-province').remove();
        d3.selectAll('#state-borders').remove();
        d3.selectAll('.tooltip').remove();
        drawIndonesia()
    }

    if (d && centered !==d){
        var centroid = pathGenerator.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
        d3.selectAll('svg#subunits path').style('fill', '#aaa').style('pointer-events' , 'none')
    }else{
        x = svgWidth / 3;
        y = svgHeight / 3;
        k = 1;
        centered = null;
    }

    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; })
    
    g.transition()
        .duration(750)
        .attr("transform", "translate(" + svgWidth / 3 + "," + svgHeight / 3 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

function vis3(data){
    
    d3.select('.web-title').append('h3').attr('id','info').text("INDONESIA")
    drawIndonesia();
    d3.select("li.vis3").on("click", function(){
        d3.select('h3').remove()
        d3.select("li.vis1").classed('selected',false)
        d3.select("li.vis2").classed('selected',false)
        d3.select("li.vis3").classed('selected',true)
        d3.selectAll('circle').remove()
        d3.selectAll('rect').remove()
        d3.selectAll('path').remove()
        d3.selectAll('.axisVote').remove()
        d3.selectAll('.axisPercentage').remove()
        d3.selectAll('select').remove()
        d3.selectAll('.legend').remove()
        d3.select('.web-title').append('h3').attr('id','info').text("INDONESIA")
        drawIndonesia();
    })
}



function vis1(data){
    
    d3.select("li.vis1").on("click", function(){
        g.transition().duration(750)
        .attr('transform','scale(1)')
        d3.select('h3').remove()
        d3.select("li.vis1").classed('selected',true)
        d3.select("li.vis2").classed('selected',false)
        d3.select("li.vis3").classed('selected',false)
        d3.selectAll('circle').remove()
        d3.selectAll('rect').remove()
        d3.selectAll('path').remove()
        d3.selectAll('.axisVote').remove()
        d3.selectAll('.axisPercentage').remove()
        d3.selectAll('.legend').remove()
        
        let provinces = topojson.feature(data[0], data[0].objects.provinces)
        //store koordinat
        provinceCoor = {}

        provinces.features.forEach(function(d){
            provinceCoor[d.properties.provinsi.toLowerCase()] = projection(d3.geoCentroid(d))
        })
        
        g.selectAll('path.provinsi').data(provinces.features)
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
        drawBarChartPercentage(data)
        d3.select("select").on("change", function(d){
            
            d3.selectAll('circle').remove()
            d3.selectAll('rect').remove()
            d3.selectAll('path.domain').remove()
            d3.selectAll('.axisVote').remove()
            d3.selectAll('.axisPercentage').remove()
            for (const prov in data[2]){
                incrementx[prov] = 0
                incrementy[prov] = 0
            }
            data[3].data.forEach(function(dDiff){
                for (const prov in data[2]){
                    if (prov == dDiff[12].split('/')[0]){
                        
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
            drawBarChartPercentage(data)
        })

    })
}

function renderLegend(){
    g.selectAll(".legend").remove()
    var yCircle = 400
    const colorScale = d3.scaleOrdinal()
    .domain(['Gap paslon 1 positif','Gap paslon 2 positif'])
    .range(['red','blue'])
    g.selectAll("mydots")
        .data(colorScale.domain())
        .enter()
        .append("circle")
            .attr('class', 'legend')
            .attr("cx", 100)
            .attr("cy", function(d,i){ return yCircle + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .style("fill", function(d){ return colorScale(d)})
    g.selectAll("mylabels")
        .data(colorScale.domain())
        .enter()
        .append("text")
            .attr('class','legend')
            .attr("x", 120)
            .attr("y", function(d,i){ return yCircle + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return colorScale(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
}

function renderLegend2(){
    g.selectAll(".legend").remove()
    var yCircle = 400
    const colorScale = d3.scaleOrdinal()
    .domain(['Selisih vote pada parent positif, pada child negatif','Selisih vote pada parent negatif, pada child positif'])
    .range(['red','blue'])
    g.selectAll("mydots")
        .data(colorScale.domain())
        .enter()
        .append("circle")
            .attr('class', 'legend')
            .attr("cx", 100)
            .attr("cy", function(d,i){ return yCircle + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .style("fill", function(d){ return colorScale(d)})
    g.selectAll("mylabels")
        .data(colorScale.domain())
        .enter()
        .append("text")
            .attr('class','legend')
            .attr("x", 120)
            .attr("y", function(d,i){ return yCircle + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return colorScale(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
}
function vis2(data){
    
    d3.select("li.vis2").on("click", function(d){
        g.transition().duration(750)
        .attr('transform','scale(1)')
        d3.select("li.vis2").classed('selected',true)
        d3.select("li.vis1").classed('selected',false)
        d3.select("li.vis3").classed('selected',false)
        d3.select('h3').remove()
        d3.selectAll('circle').remove()
        d3.selectAll('rect').remove()
        d3.selectAll('path').remove()
        d3.selectAll('.axisVote').remove()
        d3.selectAll('.axisPercentage').remove()
        d3.selectAll('.legend').remove()
        
        let provinces = topojson.feature(data[0], data[0].objects.provinces)
        //store koordinat
        provinceCoor = {}

        provinces.features.forEach(function(d){
            provinceCoor[d.properties.provinsi.toLowerCase()] = projection(d3.geoCentroid(d))
        })
        g.selectAll('path.provinsi').data(provinces.features)
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
        drawBarChartVote(data)
        d3.select("select").on("change", function(d){
            d3.selectAll('circle').remove()
            d3.selectAll('rect').remove()
            d3.selectAll('path.domain').remove()
            d3.selectAll('.axisVote').remove()
            d3.selectAll('.axisPercentage').remove()
            for (const prov in data[2]){
                incrementx[prov] = 0
                incrementy[prov] = 0
            }
            data[1].data.forEach(function(dDiff){
                for (const prov in data[2]){
                    if (prov == dDiff[12].split('/')[0]){
                        
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
            drawBarChartVote(data)
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

function drawBarChartPercentage(data){
    let dataBar = []
    let provCount = {}
    let provCountRed = {}
    let provCountBlue = {}

    for (const prov in data[2]){
        provCount[data[2][prov].nama.toLowerCase()] = 0
        provCountRed[data[2][prov].nama.toLowerCase()] = 0
        provCountBlue[data[2][prov].nama.toLowerCase()] = 0
    }
    data[3].data.forEach(function(d){
        for (const prov in data[2]){
            if (prov == d[12].split('/')[0]){
                if (d3.select("select").property("value")== "all"){
                    provCount[data[2][prov].nama.toLowerCase()] ++
                    if (d[9] >= 0){
                        provCountRed[data[2][prov].nama.toLowerCase()] ++
                    }else{
                        provCountBlue[data[2][prov].nama.toLowerCase()] ++
                    }  
                }else{
                    if (d[1] == d3.select("select").property("value")){
                        
                        provCount[data[2][prov].nama.toLowerCase()] ++
                        if (d[9] >= 0){
                            provCountRed[data[2][prov].nama.toLowerCase()] ++
                        }else{
                            provCountBlue[data[2][prov].nama.toLowerCase()] ++
                        }  
                    }
                }     
            }
        }
    })
    
    for (const prov in data[2]){
        if (provCount[data[2][prov].nama.toLowerCase()] != 0){
            var temp = []
            var objTempRed = { value : provCountRed[data[2][prov].nama.toLowerCase()], category : "red" }
            var objTempBlue = { value : provCountBlue[data[2][prov].nama.toLowerCase()], category : "blue" }
            temp.push(objTempRed)
            temp.push(objTempBlue)
            var barDat = { prov : data[2][prov].nama.toLowerCase(), count : temp }
            dataBar.push(barDat)
            
        }
    }

    
    var margin = {left : 30, top : 450, right: 0, bottom:0}
    barWidth = svgWidth - margin.left - margin.right
    barHeight = svgHeight - margin.top - margin.bottom

    const xScale = d3.scaleBand()
    .domain(dataBar.map(d=>d.prov)).padding(0.1)
    .range([0,barWidth])

    
    const xScaleGroup = d3.scaleBand()
    .domain(dataBar[0].count.map(d=>d.category)).padding(0.1)
    .range([0,xScale.bandwidth()])
    
    

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataBar, function(categorie) {return d3.max(categorie.count, function(d) { return d.value; }); })])
    .range([barHeight/3,0])

    console.log(yScale.domain())
    var slice = g.selectAll(".slice")
      .data(dataBar)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform",function(d) { return "translate(" + xScale(d.prov) + ",0)"; });

    slice.selectAll('rect').data(d=>d.count)
    .enter()
    .append('rect')
    .attr('class', 'bar-chart')
    .attr('transform',`translate(${margin.left},${margin.top})`)
    .attr('x', d => xScaleGroup(d.category))
    .attr('y', d=>yScale(0))
    .style('fill',d=>d.category)
    .attr('width', xScaleGroup.bandwidth())
    .attr('height',d => barHeight/3 - yScale(0))
    .on("mouseover", function(d) {
        d3.select(this).style("fill", d3.rgb(d.category).darker(2))
    })
    .on("mouseout", function(d) {
        d3.select(this).style("fill", d.category);
    });

    slice.selectAll("rect")
      .transition()
      .delay(function (d) {return Math.random()*1000;})
      .duration(1000)
      .attr("y", function(d) { return yScale(d.value); })
      .attr("height", function(d) { return barHeight/3 - yScale(d.value); });

    
    var marginAxis = {left : 30, top : 633, right: 0, bottom:0}
    g.append("g")
    .attr('transform',`translate(${marginAxis.left},${marginAxis.top})`)
    .attr('class','axisPercentage')
         .call(d3.axisBottom(xScale))
         .selectAll("text")
         .attr("transform", "translate(-10,0)rotate(-45)")
         .style("text-anchor", "end");
     

    var marginAxisY = {left : 20, top : 450, right: 0, bottom:0}

    if (d3.select("select").property("value")== "kec"){
        var axis = [0,1,2,3]
    }else if (d3.select("select").property("value")== "kel"){
        var axis = [0,1,2,3,4,5]
    }else{
        var axis = [0,1,2,3,4,5,6]
    }
    
    g.append("g")
    .attr('transform',`translate(${marginAxisY.left},${marginAxisY.top})`)
    .attr('class','axisVote')
    .call(d3.axisLeft(yScale).tickValues(axis).tickFormat(d3.format("d")))

}

function drawBarChartVote(data){
    let dataBar = []
    let provCount = {}
    let provCountRed = {}
    let provCountBlue = {}

    for (const prov in data[2]){
        provCount[data[2][prov].nama.toLowerCase()] = 0
        provCountRed[data[2][prov].nama.toLowerCase()] = 0
        provCountBlue[data[2][prov].nama.toLowerCase()] = 0
    }
    data[1].data.forEach(function(d){
        for (const prov in data[2]){
            if (prov == d[12].split('/')[0]){
                if (d3.select("select").property("value")== "all"){
                    provCount[data[2][prov].nama.toLowerCase()] ++
                    if (d[9] >= 0){
                        provCountRed[data[2][prov].nama.toLowerCase()] ++
                    }else{
                        provCountBlue[data[2][prov].nama.toLowerCase()] ++
                    }  
                }else{
                    if (d[1] == d3.select("select").property("value")){
                        
                        provCount[data[2][prov].nama.toLowerCase()] ++
                        if (d[9] >= 0){
                            provCountRed[data[2][prov].nama.toLowerCase()] ++
                        }else{
                            provCountBlue[data[2][prov].nama.toLowerCase()] ++
                        }  
                    }
                }     
            }
        }
    })
    
    for (const prov in data[2]){
        if (provCount[data[2][prov].nama.toLowerCase()] != 0){
            var temp = []
            var objTempRed = { value : provCountRed[data[2][prov].nama.toLowerCase()], category : "red" }
            var objTempBlue = { value : provCountBlue[data[2][prov].nama.toLowerCase()], category : "blue" }
            temp.push(objTempRed)
            temp.push(objTempBlue)
            var barDat = { prov : data[2][prov].nama.toLowerCase(), count : temp }
            dataBar.push(barDat)
            
        }
    }

    
    var margin = {left : 30, top : 450, right: 0, bottom:0}
    barWidth = svgWidth - margin.left - margin.right
    barHeight = svgHeight - margin.top - margin.bottom

    const xScale = d3.scaleBand()
    .domain(dataBar.map(d=>d.prov)).padding(0.1)
    .range([0,barWidth])

    
    const xScaleGroup = d3.scaleBand()
    .domain(dataBar[0].count.map(d=>d.category)).padding(0.1)
    .range([0,xScale.bandwidth()])
    
    

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataBar, function(categorie) {return d3.max(categorie.count, function(d) { return d.value; }); })])
    .range([barHeight/3,0])

    console.log(yScale.domain())
    var slice = g.selectAll(".slice")
      .data(dataBar)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform",function(d) { return "translate(" + xScale(d.prov) + ",0)"; });

    slice.selectAll('rect').data(d=>d.count)
    .enter()
    .append('rect')
    .attr('class', 'bar-chart')
    .attr('transform',`translate(${margin.left},${margin.top})`)
    .attr('x', d => xScaleGroup(d.category))
    .attr('y', d=>yScale(0))
    .style('fill',d=>d.category)
    .attr('width', xScaleGroup.bandwidth())
    .attr('height',d => barHeight/3 - yScale(0))
    .on("mouseover", function(d) {
        d3.select(this).style("fill", d3.rgb(d.category).darker(2))
    })
    .on("mouseout", function(d) {
        d3.select(this).style("fill", d.category);
    });

    slice.selectAll("rect")
      .transition()
      .delay(function (d) {return Math.random()*1000;})
      .duration(1000)
      .attr("y", function(d) { return yScale(d.value); })
      .attr("height", function(d) { return barHeight/3 - yScale(d.value); });

    
    var marginAxis = {left : 30, top : 633, right: 0, bottom:0}
    g.append("g")
    .attr('transform',`translate(${marginAxis.left},${marginAxis.top})`)
    .attr('class','axisPercentage')
         .call(d3.axisBottom(xScale))
         .selectAll("text")
         .attr("transform", "translate(-10,0)rotate(-45)")
         .style("text-anchor", "end");
     

    var marginAxisY = {left : 20, top : 450, right: 0, bottom:0}

    
    var axis = [0,1]
    
    
    g.append("g")
    .attr('transform',`translate(${marginAxisY.left},${marginAxisY.top})`)
    .attr('class','axisVote')
    .call(d3.axisLeft(yScale).tickValues(axis).tickFormat(d3.format("d")))
}