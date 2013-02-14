// Coffee Flavour Wheel by Jason Davies,
// http://www.jasondavies.com/coffee-wheel/
// License: http://www.jasondavies.com/coffee-wheel/LICENSE.txt
var width = 840,
    height = width,
    radius = width / 2,
    x = d3.scale.linear().range([0, 2 * Math.PI]),
    y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
    padding = 5,
    duration = 1000;

var div = d3.select("#vis");

div.select("img").remove();

var vis = div.append("svg")
    .attr("width", width + padding * 2)
    .attr("height", height + padding * 2)
  .append("g")
    .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

div.append("p")
    .attr("id", "intro")
    .text("Click to zoom!");

var partition = d3.layout.partition()
    .sort(null)
    .value(function(d) { return d.value; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

d3.json("wheel.json", function(json) {
  var nodes = partition.nodes({children: json});

  var path = vis.selectAll("path").data(nodes);
  path.enter().append("path")
      .attr("id", function(d, i) { return "path-" + i; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d){return d.colour;})
      .on("click", click)
      .attr("class", function(d){
        if(d.title != undefined){
          return "arco";
        }
        return "";
      })
      .attr("title", function(d) {
        return d.title;
      })

  var text = vis.selectAll("text").data(nodes);
  var textEnter = text.enter().append("text")
      .style("fill-opacity", 1)
      .style("font-family", "sans-serif")
      .style("font-size", 12)
      .style("fill", "#fff")
      .attr("class", function(d){
        if(d.title != undefined){
          return "arco";
        }
        return "";
      })
      .attr("title", function(d) {
        return d.title;
      })
      .attr("text-anchor", function(d) {
        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
      })
      .attr("dy", ".2em")
      .attr("transform", function(d) {
        var multiline = (d.name || "").split(" ").length > 1,
            angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
            rotate = angle + (multiline ? -.5 : 0);
        return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
      })
      .on("click", click);
  textEnter.append("tspan")
      .attr("x", 0)


      .text(function(d) { 
        var line = "";
        if(d.name == undefined){
          return "";
        }
        var existe_guion = d.name.indexOf("-")!=-1;
          if (existe_guion){
            console.log(d.name)
            return d.name.split("-")[0] ;
          }
          else{
            return d.name;
            
          }
         });

  textEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "1em")
      .text(function(d) { 
        var line = "";
        if(d.name == undefined){
          return "";
        }
        var existe_guion = d.name.indexOf("-")!=-1;
          if (existe_guion){
            console.log(d.name)
            return d.name.split("-")[1] ;
          }
          else{
            return "";
            
          }
         });

    textEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "1em")
      .text(function(d) { 
        var line = "";
        if(d.name == undefined){
          return "";
        }
        var existe_guion = d.name.indexOf("-")!=-1;
          if (existe_guion){
            console.log(d.name)
            return d.name.split("-")[2] ;
          }
          else{
            return "";
            
          }
         });

  textEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "1em")
      .attr("class","porcentaje_alternativa")
      .text(function(d) {
        if( d.depth >0 && d.depth < 3){
          if(d.porcentaje != undefined){
            return d.porcentaje + "%";
          }
        }
        return "";
        
         });

      $('.arco').qtip({

            content: {

            text: function(api) {
                                  // Retrieve content from custom attribute of the $('.selector') elements.
                                  return $(this).attr('title');
                                }

            },

            position: {

                        target: 'mouse',
                        adjust: {
                                  mouse: false,
                                  x: 10,
                                  y: 10
                                }

                       },            
            style: {
                        classes: 'ui-tooltip-bootstrap ui-tooltip-shadow',
                        tip: {
                                corner: 'left center'
                            }
                    }


      });

  function click(d) {
    path.transition()
      .duration(duration)
      .attrTween("d", arcTween(d));

    // Somewhat of a hack as we rely on arcTween updating the scales.
    text.style("visibility", function(e) {
          return isParentOf(d, e) ? null : d3.select(this).style("visibility");
        })
      .transition()
        .duration(duration)
        .attrTween("text-anchor", function(d) {
          return function() {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
          };
        })
        .attrTween("transform", function(d) {
          var multiline = (d.name || "").split(" ").length > 1;
          return function() {
            var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
          };
        })
        .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
        .each("end", function(e) {
          d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
        });
  }
});

function isParentOf(p, c) {
  if (p === c) return true;
  if (p.children) {
    return p.children.some(function(d) {
      return isParentOf(d, c);
    });
  }
  return false;
}

function colour(d) {
  if (d.children) {
    // There is a maximum of two children!
    var colours = d.children.map(colour),
        a = d3.hsl(colours[0]),
        b = d3.hsl(colours[1]);
    // L*a*b* might be better here...
    return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
  }
  return d.colour || "#fff";
}

// Interpolate the scales!
function arcTween(d) {
  var my = maxY(d),
      xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, my]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d) {
    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function maxY(d) {
  return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
}

// http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
function brightness(rgb) {
  return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
}
