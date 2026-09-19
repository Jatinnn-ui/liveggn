export const CITY = { name: 'Gurugram', center: [77.0885,28.4945], bounds: [[76.94,28.36],[77.16,28.56]] };
// Curated public locations; coordinates are approximate point locations, not entrances.
export const PLACES = [
 {id:'cyberhub',name:'DLF Cyber Hub',category:'Dining & entertainment',type:'landmark',coordinates:[77.0885,28.4950],area:'DLF Cyber City',description:'An open-air dining and social destination at the heart of Cyber City. Explore its pedestrian plaza, restaurants, and cafés.',image:'images/cyberhub.jpg'},
 {id:'ambience',name:'Ambience Mall',category:'Shopping',type:'shopping',coordinates:[77.0971,28.5038],area:'NH 48, DLF Phase 3',description:'A major shopping destination near the Delhi–Gurugram border, with retail, dining, and entertainment.'},
 {id:'starbucks',name:'Starbucks · Cyber Hub',category:'Coffee',type:'cafe',coordinates:[77.0882,28.4956],area:'DLF Cyber Hub',description:'A coffee stop within the Cyber Hub complex. Hours and availability are not connected to a live provider.'},
 {id:'social',name:'Cyber Hub Social',category:'Restaurant',type:'restaurant',coordinates:[77.0889,28.4948],area:'DLF Cyber Hub',description:'A casual dining and social space in Cyber Hub. Check current opening hours with the venue.'},
 {id:'biodiversity',name:'Aravali Biodiversity Park',category:'Park',type:'park',coordinates:[77.1120,28.4814],area:'MG Road',description:'Restored native Aravalli habitat with trails through dry deciduous woodland. The point shown is approximate; use a verified park entrance.'},
 {id:'leisure',name:'Leisure Valley Park',category:'Park',type:'park',coordinates:[77.0672,28.4695],area:'Sector 29',description:'A green public space in Sector 29, with walking paths and open lawns.'},
 {id:'sikanderpur',name:'Sikanderpur Metro',category:'Metro station',type:'transit',coordinates:[77.0930,28.4813],area:'MG Road',lines:'Yellow Line · Rapid Metro interchange',description:'An interchange between the Delhi Metro Yellow Line and Gurugram Rapid Metro. Live arrivals and operating hours are unavailable.'},
 {id:'cybermetro',name:'Cyber City Metro',category:'Metro station',type:'transit',coordinates:[77.0939,28.4997],area:'DLF Cyber City',lines:'Rapid Metro',description:'Rapid Metro station serving the Cyber City office district. Also known as IndusInd Bank Cyber City. No live arrivals are provided.'},
 {id:'phase2',name:'DLF Phase 2 Metro',category:'Metro station',type:'transit',coordinates:[77.0931,28.4876],area:'DLF Phase 2',lines:'Rapid Metro',description:'Rapid Metro station serving DLF Phase 2. Verify service hours before travelling.'},
 {id:'iffco',name:'IFFCO Chowk Metro',category:'Metro station',type:'transit',coordinates:[77.0725,28.4720],area:'Sector 29',lines:'Yellow Line',description:'Delhi Metro Yellow Line station at IFFCO Chowk. No real-time arrival data is available.'},
 {id:'golfroad',name:'Golf Course Road',category:'Road',type:'road',coordinates:[77.1008,28.4557],area:'DLF Phase 5',description:'A major urban corridor connecting residential, commercial, and business districts in eastern Gurugram.'},
 {id:'medanta',name:'Medanta · The Medicity',category:'Hospital',type:'hospital',coordinates:[77.0407,28.4394],area:'Sector 38',description:'A multispecialty hospital campus in Sector 38. For an emergency, contact local emergency services directly.'},
 {id:'westin',name:'The Westin Gurgaon',category:'Hotel',type:'hotel',coordinates:[77.0701,28.4757],area:'MG Road',description:'A business hotel near IFFCO Chowk. Room availability is not connected.'}
];
export const DEMO_MARKERS = [
 {id:'event',name:'Evening in the plaza',category:'Demo event',type:'event',coordinates:[77.0872,28.4962],area:'Cyber City · hypothetical location',description:'DEMO EVENT — an illustrative outdoor music evening, 18:00–20:00. This is not an actual event listing. No booking is available.'},
 {id:'construction',name:'Road maintenance example',category:'Demo construction',type:'construction',coordinates:[77.085,28.4908],area:'Cyber City · hypothetical location',description:'SIMULATED — illustrative maintenance zone. Expected impact: a slower local lane. This is not a verified road closure.'}
];
export const featureCollection = (features=[]) => ({type:'FeatureCollection',features});
export const pointFeature = (coordinates,properties={}) => ({type:'Feature',geometry:{type:'Point',coordinates},properties});
export function distanceKm(a,b){const r=Math.PI/180;const dLat=(b[1]-a[1])*r,dLng=(b[0]-a[0])*r;const h=Math.sin(dLat/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dLng/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
