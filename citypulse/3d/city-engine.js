import {CITY,PLACES,DEMO_MARKERS,featureCollection,pointFeature} from '../city-data/places.js';
import {FacadeDetails} from './facade-details.js';
const EMPTY=featureCollection();
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class CityEngine {
 constructor({onReady,onSelect,onError,onMove}){this.onSelect=onSelect;this.onError=onError;this.markers=[];this.layers={buildings:true,roads:true,traffic:true,weather:false,aqi:false,transit:false,restaurants:false,events:false,construction:false,crowd:false};this.time=17.5;this.weather='clear';this.trafficDensity=1;this.onReady=onReady;this.onMove=onMove;this.init();}
 async init(){try{if(!window.maplibregl)throw new Error('The map library could not load. Check your connection and reload.');const response=await fetch('city-data/basemap-style.json');if(!response.ok)throw new Error('The map style could not load.');const style=await response.json();style.sources.satellite={type:'raster',tiles:['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'};const firstLine=style.layers.findIndex(l=>l.type==='line');style.layers.splice(firstLine,0,{id:'satellite-image',type:'raster',source:'satellite',paint:{'raster-saturation':-.65,'raster-brightness-min':.07,'raster-brightness-max':.69,'raster-contrast':.12}});style.layers.forEach(l=>{if(l.paint?.['fill-pattern'])delete l.paint['fill-pattern'];if(l['source-layer']==='building')l.layout={...l.layout,visibility:'none'};if(l.type==='symbol'){l.paint={...l.paint,'text-color':'#d9dfde','text-halo-color':'#202725','text-halo-width':1.8};if(l.id.includes('poi'))l.layout={...l.layout,visibility:'none'};}if(l.type==='line'&&l['source-layer']==='transportation'&&l.paint?.['line-color'])l.paint['line-opacity']=.48;});
 this.map=new maplibregl.Map({container:'city-map',style,center:CITY.center,zoom:13.4,pitch:35,bearing:-26,maxPitch:75,minZoom:10,maxZoom:19.5,attributionControl:false,antialias:true,dragRotate:true,maxBounds:[[76.75,28.15],[77.4,28.8]]});this.map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');this.map.on('error',e=>{console.warn('Map provider:',e.error?.message||'Temporary map data issue');if(!this.mapReady)this.onError('Some geographic tiles are unavailable. Check your internet connection.');});this.map.on('load',()=>{try{this.mapReady=true;this.setup();onReadySafe(this.onReady);}catch(error){this.mapReady=false;this.onError('The 3D scene could not initialize. '+error.message);return;}this.map.flyTo({center:CITY.center,zoom:15.35,pitch:61,bearing:-26,duration:2600,essential:false});});this.map.on('moveend',()=>this.onMove?.(this.map.getCenter(),this.map.getZoom()));this.map.on('click',e=>this.inspectMap(e));this.map.on('dragstart',()=>this.stopFollowing());this.map.on('zoomstart',e=>{if(e.originalEvent)this.stopFollowing();});this.map.on('idle',()=>{if(this.trafficLayer&&!this.trafficLayer.paths.length)this.collectRoads();});this.map.on('moveend',()=>{clearTimeout(this.refreshTimer);this.refreshTimer=setTimeout(()=>this.collectRoads(),250);});}catch(error){this.onError(error.message);}}
 setup(){const map=this.map;const labels=map.getStyle().layers.find(l=>l.type==='symbol')?.id;map.setLight({anchor:'viewport',color:'#ffe5c5',intensity:.45,position:[1.2,190,45]});map.addLayer({id:'city-buildings',source:'openmaptiles','source-layer':'building',type:'fill-extrusion',minzoom:13,paint:{'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],12],0,'#969f98',15,'#c0c1af',40,'#d5d2bb',100,'#abbcc0'],'fill-extrusion-height':['interpolate',['linear'],['zoom'],13,0,14,['coalesce',['get','render_height'],['*',['coalesce',['get','building:levels'],4],3.2]]],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':.95,'fill-extrusion-vertical-gradient':true}},labels);
 map.addSource('aqi',{type:'geojson',data:featureCollection(PLACES.map((p,i)=>pointFeature(p.coordinates,{value:60+(i*17)%100})))});map.addLayer({id:'aqi-layer',type:'heatmap',source:'aqi',layout:{visibility:'none'},paint:{'heatmap-radius':100,'heatmap-weight':['interpolate',['linear'],['get','value'],0,.1,200,1],'heatmap-intensity':.7,'heatmap-opacity':.32,'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(120,166,105,0)',.3,'rgba(176,171,87,.4)',.7,'rgba(206,149,89,.6)',1,'rgba(190,106,82,.7)']}},'city-buildings');
 map.addLayer({id:'traffic-roads',type:'line',source:'openmaptiles','source-layer':'transportation',filter:['in',['get','class'],['literal',['motorway','trunk','primary','secondary']]],minzoom:12,paint:{'line-color':['match',['get','class'],'motorway','#d8a05e','trunk','#cf9264','primary','#c5b177','#83a697'],'line-width':['interpolate',['linear'],['zoom'],12,1,16,2.4,19,5],'line-opacity':.72}},'city-buildings');
 map.addLayer({id:'transit-lines',type:'line',source:'openmaptiles','source-layer':'transportation',filter:['in',['get','class'],['literal',['rail','transit']]],layout:{visibility:'none'},paint:{'line-color':'#8aa9d4','line-width':3,'line-dasharray':[2,1],'line-opacity':.85}},'city-buildings');
 const crowds=[];PLACES.slice(0,10).forEach((p,j)=>{for(let i=0;i<30;i++)crowds.push(pointFeature([p.coordinates[0]+Math.sin(i*17+j)*.0007,p.coordinates[1]+Math.cos(i*13+j)*.00055]));});map.addSource('crowd',{type:'geojson',data:featureCollection(crowds)});map.addLayer({id:'crowd-points',type:'circle',source:'crowd',layout:{visibility:'none'},paint:{'circle-radius':['interpolate',['linear'],['zoom'],12,1,17,2.7],'circle-color':'#d8bda3','circle-opacity':.7}});
 map.addSource('route',{type:'geojson',data:EMPTY});map.addLayer({id:'route-shadow',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#122e43','line-width':10,'line-opacity':.8}});map.addLayer({id:'route-line',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#a0d2f2','line-width':4,'line-opacity':1}});
 map.addSource('route-head',{type:'geojson',data:EMPTY});map.addLayer({id:'route-head-point',type:'circle',source:'route-head',paint:{'circle-radius':6,'circle-color':'#effbff','circle-stroke-color':'#84bce3','circle-stroke-width':4}});
 this.addMarkers();if(window.THREE){this.trafficLayer=this.createTrafficLayer();map.addLayer(this.trafficLayer);setTimeout(()=>this.collectRoads(),1600);}this.setTime(this.time); }
 addMarkers(){const visible=['cyberhub','ambience','cybermetro','phase2','starbucks','social','sikanderpur','biodiversity'];[...PLACES.filter(p=>visible.includes(p.id)),...DEMO_MARKERS].forEach(p=>{const el=document.createElement('button');el.className=`place-marker ${p.type} ${p.id==='cyberhub'?'selected':''}`;el.setAttribute('aria-label',`Inspect ${p.name}`);const icons={landmark:'building-2',shopping:'shopping-bag',transit:'train-front',cafe:'coffee',restaurant:'utensils',park:'trees',event:'calendar-days',construction:'construction'};el.innerHTML=`<span class="marker-icon"><i data-lucide="${icons[p.type]||'map-pin'}"></i></span><span class="marker-label">${escapeHTML(p.name)}${p.id==='cyberhub'?'<small>DINING & ENTERTAINMENT</small>':''}${['event','construction'].includes(p.type)?'<small>DEMO DATA</small>':''}</span>`;el.addEventListener('click',e=>{e.stopPropagation();this.select(p);});const marker=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(p.coordinates).addTo(this.map);this.markers.push({marker,el,place:p});});this.refreshMarkers();window.lucide?.createIcons();}
 refreshMarkers(){this.markers.forEach(({el,place:p})=>{let visible=p.type==='landmark'||p.type==='shopping';if(p.type==='transit')visible=this.layers.transit;if(p.type==='cafe'||p.type==='restaurant')visible=this.layers.restaurants;if(p.type==='park')visible=this.layers.crowd;if(p.type==='event')visible=this.layers.events;if(p.type==='construction')visible=this.layers.construction;if(this.selectedId===p.id)visible=true;el.style.display=visible?'flex':'none';});}
 select(place,{fly=true}={}){this.selectedId=place.id;this.markers.forEach(m=>m.el.classList.toggle('selected',m.place.id===place.id));this.refreshMarkers();if(fly)this.flyTo(place.coordinates);this.onSelect(place);}
 flyTo(coordinates){if(!this.mapReady)return;this.stopFollowing();this.map.flyTo({center:coordinates,zoom:16.25,pitch:61,bearing:this.map.getBearing(),duration:1600,essential:false,padding:{right:window.innerWidth>1000?170:0,left:window.innerWidth>1000?80:0,top:30,bottom:40}});}
 inspectMap(e){if(!this.mapReady)return;const features=this.map.queryRenderedFeatures(e.point,{layers:['city-buildings','traffic-roads']});const f=features[0];if(f){const building=f.layer.id==='city-buildings';this.select({id:'map-selection',name:f.properties.name||f.properties['name:en']||(building?'Mapped building':'Mapped road'),type:building?'building':'road',category:building?'Building footprint':'Road geometry',coordinates:[e.lngLat.lng,e.lngLat.lat],area:'Gurugram · OpenStreetMap',description:building?`Real OpenStreetMap footprint. Rendered height: ${Math.round(f.properties.render_height||12.8)} m (OSM-derived or estimated). Facades, tenants, and precise architectural details are unavailable.`:`Road class: ${f.properties.class||'local'}. Geometry from OpenStreetMap. Traffic is simulated, not a live observation.`},{fly:false});}else this.select({id:'map-location',name:'Selected location',category:'Geographic point',type:'place',coordinates:[e.lngLat.lng,e.lngLat.lat],area:'Gurugram',description:'Explore nearby curated places or generate a road route to this point. Place details and opening status are unavailable.'},{fly:false});}
 toggleLayer(key,value){this.layers[key]=value;if(!this.mapReady)return;const ids={buildings:['city-buildings'],traffic:['traffic-roads'],aqi:['aqi-layer'],transit:['transit-lines'],crowd:['crowd-points']};(ids[key]||[]).forEach(id=>this.map.setLayoutProperty(id,'visibility',value?'visible':'none'));if(key==='roads')this.map.getStyle().layers.filter(l=>l['source-layer']==='transportation'&&!['traffic-roads','transit-lines'].includes(l.id)).forEach(l=>this.map.setLayoutProperty(l.id,'visibility',value?'visible':'none'));if(key==='weather')this.setWeather(this.weather);this.refreshMarkers();this.map.triggerRepaint();}
 setTime(time){this.time=Number(time);const night=time>=20||time<6;const sunset=time>=16&&time<20;document.body.dataset.time=night?'night':sunset?'sunset':'day';if(!this.mapReady)return;this.map.setLight({anchor:'map',color:night?'#aebed8':sunset?'#ffdfb3':'#ffffff',intensity:night?.24:.52,position:[1.4,(time*15)%360,night?70:sunset?65:25]});this.map.setPaintProperty('satellite-image','raster-brightness-max',night?.35:sunset?.69:.86);this.map.setPaintProperty('city-buildings','fill-extrusion-color',night?['interpolate',['linear'],['coalesce',['get','render_height'],12],0,'#424e56',40,'#67757b',100,'#8f9589']:['interpolate',['linear'],['coalesce',['get','render_height'],12],0,'#969f98',15,sunset?'#c0c1af':'#c6c8c4',40,sunset?'#d5d2bb':'#d4d8d7',100,'#abbcc0']);this.trafficDensity=(time>=17&&time<20)||(time>=8&&time<10)?1:.5;this.map.setPaintProperty('crowd-points','circle-opacity',night?.3:.7);}
 setWeather(weather){this.weather=weather;const state=this.layers.weather?weather:'clear';document.getElementById('weather-effects').dataset.weather=state;if(this.mapReady)this.map.setPaintProperty('satellite-image','raster-contrast',state==='cloudy'?-.2:state==='rain'?.25:.12);}
 async drawRoute(route){if(!this.mapReady)return;this.stopFollowing();cancelAnimationFrame(this.routeAnimation);this.route=route;const coords=route.geometry.coordinates;this.routeCoordinates=coords;this.overview();const start=performance.now();const frame=now=>{const n=Math.min(coords.length,Math.max(2,Math.floor((now-start)/1300*coords.length)));this.map.getSource('route').setData({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:coords.slice(0,n)}});if(n<coords.length)this.routeAnimation=requestAnimationFrame(frame);};this.routeAnimation=requestAnimationFrame(frame);}
 overview() {
  if (!this.mapReady) return;
  this.stopFollowing();
  if (this.routeCoordinates) {
   const bounds = new maplibregl.LngLatBounds();
   this.routeCoordinates.forEach(coordinate => bounds.extend(coordinate));
   const container = this.map.getContainer();
   const wide = container.clientWidth > 1000;
   const padding = wide ? {top:170,bottom:265,left:320,right:340} : {top:140,bottom:300,left:50,right:50};
   // Reserve space for panels without exhausting the canvas on shorter screens.
   const horizontal = Math.min(1, container.clientWidth * .65 / (padding.left + padding.right));
   const vertical = Math.min(1, container.clientHeight * .65 / (padding.top + padding.bottom));
   padding.left *= horizontal; padding.right *= horizontal;
   padding.top *= vertical; padding.bottom *= vertical;
   this.map.setPadding({top:0,bottom:0,left:0,right:0});
   this.map.fitBounds(bounds, {padding, maxZoom:17, pitch:50, duration:1400});
  } else {
   this.map.flyTo({center:CITY.center,zoom:15.35,pitch:61,bearing:-26,duration:1300,padding:0});
  }
 }
 follow(){if(!this.routeCoordinates?.length)return false;this.stopFollowing();const coords=this.routeCoordinates;let index=0;const tick=()=>{if(index>=coords.length-1){this.stopFollowing();return;}const next=Math.min(coords.length-1,index+Math.max(1,Math.floor(coords.length/65)));const a=coords[index],b=coords[next];const bearing=Math.atan2((b[0]-a[0])*Math.cos(a[1]*Math.PI/180),b[1]-a[1])*180/Math.PI;this.map.easeTo({center:a,zoom:17.1,pitch:65,bearing,duration:550,padding:{top:0,bottom:120,left:0,right:0},easing:t=>t});this.map.getSource('route-head').setData(featureCollection([pointFeature(a)]));index=next;};tick();this.followTimer=setInterval(tick,550);return true;}
 stopFollowing(){clearInterval(this.followTimer);this.followTimer=null;}
 clearRoute(){this.stopFollowing();cancelAnimationFrame(this.routeAnimation);this.routeCoordinates=null;if(this.mapReady){this.map.getSource('route').setData(EMPTY);this.map.getSource('route-head').setData(EMPTY);}}
 collectRoads(){if(!this.mapReady||!this.trafficLayer)return;const features=this.map.querySourceFeatures('openmaptiles',{sourceLayer:'transportation',filter:['in',['get','class'],['literal',['motorway','trunk','primary','secondary','tertiary']]]});const paths=[];const seen=new Set();for(const f of features){const lines=f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.type==='MultiLineString'?f.geometry.coordinates:[];for(const line of lines){if(line.length<2)continue;const key=line[0].join(',');if(seen.has(key))continue;seen.add(key);const local=line.map(c=>{const mc=maplibregl.MercatorCoordinate.fromLngLat(c);return [(mc.x-this.trafficLayer.origin.x)/this.trafficLayer.scale,(mc.y-this.trafficLayer.origin.y)/this.trafficLayer.scale];});let length=0;const segments=local.slice(1).map((b,i)=>{const a=local[i];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);length+=len;return {a,b,len,end:length};});if(length>30&&length<15000)paths.push({segments,length});if(paths.length>=100)break;}if(paths.length>=100)break;}this.trafficLayer.paths=paths;this.trafficLayer.facades?.update(this.map);}
 createTrafficLayer() {
  const engine = this, T = window.THREE;
  const origin = maplibregl.MercatorCoordinate.fromLngLat(CITY.center, 0);
  const scale = origin.meterInMercatorCoordinateUnits();
  const maxVehicles = window.innerWidth <= 650 ? 80 : 220;
  return {
   id: 'instanced-vehicles', type: 'custom', renderingMode: '3d', origin, scale, paths: [],
   onAdd(map, gl) {
    this.camera = new T.Camera();
    this.scene = new T.Scene();
    this.mesh = new T.InstancedMesh(new T.BoxGeometry(2.2, 4.6, 1.6), new T.MeshBasicMaterial({color: '#e9d8b4'}), maxVehicles);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.facades = new FacadeDetails(T, this.scene, origin, scale, window.innerWidth <= 650);
    this.object = new T.Object3D();
    this.renderer = new T.WebGLRenderer({canvas: map.getCanvas(), context: gl, antialias: true});
    this.renderer.autoClear = false;
    this.transform = new T.Matrix4().makeTranslation(origin.x, origin.y, origin.z).scale(new T.Vector3(scale, scale, scale));
   },
   render(gl, matrix) {
    const night = engine.time >= 20 || engine.time < 6;
    this.facades.setVisible(night && engine.layers.buildings);
    this.mesh.visible = engine.layers.traffic;
    if (!engine.layers.traffic && !night) return;
    const time = performance.now() / 1000;
    const count = Math.min(maxVehicles, Math.floor(this.paths.length * 3 * engine.trafficDensity));
    this.mesh.count = count;
    for (let i = 0; i < count; i++) {
     const path = this.paths[i % this.paths.length];
     const d = (time * (7 + (i % 5) * 2) + i * 57) % path.length;
     const segment = path.segments.find(s => s.end >= d) || path.segments.at(-1);
     const t = segment.len ? (d - (segment.end - segment.len)) / segment.len : 0;
     const dx = segment.b[0] - segment.a[0], dy = segment.b[1] - segment.a[1], length = segment.len || 1;
     this.object.position.set(segment.a[0] + dx * t - dy / length * 2, segment.a[1] + dy * t + dx / length * 2, 1.4);
     this.object.rotation.set(0, 0, -Math.atan2(dx, dy));
     this.object.updateMatrix();
     this.mesh.setMatrixAt(i, this.object.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.camera.projectionMatrix = new T.Matrix4().fromArray(matrix).multiply(this.transform);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    if (!document.hidden && engine.layers.traffic) engine.map.triggerRepaint();
   },
   onRemove() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.facades.dispose();
    this.renderer.dispose();
   }
  };
 }
}
function onReadySafe(fn){if(typeof fn==='function')fn();}
