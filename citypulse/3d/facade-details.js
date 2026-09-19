// Illustrative facade lighting derived from visible OSM building edges.
// This adds no invented building footprints or claims about real window layouts.
export class FacadeDetails {
 constructor(THREE, scene, origin, meterScale, mobile = false) {
  this.T = THREE;
  this.origin = origin;
  this.scale = meterScale;
  this.limit = mobile ? 650 : 1800;
  this.object = new THREE.Object3D();
  this.windows = new THREE.InstancedMesh(
   new THREE.BoxGeometry(1.1, 0.12, 1.5),
   new THREE.MeshBasicMaterial({color: '#d7bb87', transparent: true, opacity: 0.72}),
   this.limit
  );
  this.windows.count = 0;
  this.windows.frustumCulled = false;
  scene.add(this.windows);
 }
 update(map) {
  if (!map.getLayer('city-buildings')) return;
  const buildings = map.queryRenderedFeatures({layers: ['city-buildings']});
  const seen = new Set();
  let count = 0;
  for (const feature of buildings) {
   const height = Number(feature.properties.render_height) || 12.8;
   if (height < 9 || height > 250) continue;
   const polygons = feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates]
    : feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [];
   for (const polygon of polygons) {
    const ring = polygon[0];
    if (!ring || ring.length < 4) continue;
    const key = ring[0].join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    for (let edge = 0; edge < ring.length - 1; edge++) {
     const a = this.local(ring[edge]);
     const b = this.local(ring[edge + 1]);
     const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
     if (length < 8 || length > 180) continue;
     const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
     const columns = Math.floor(length / 4.5);
     for (let floor = 1; floor * 3.4 + 1.5 < height; floor += 2) {
      for (let column = 1; column < columns; column++) {
       // Sparse, deterministic occupancy prevents a uniform glowing building.
       if ((column * 7 + floor * 3 + edge) % 5 > 1) continue;
       const t = column / columns;
       this.object.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, floor * 3.4);
       this.object.rotation.set(0, 0, angle);
       this.object.updateMatrix();
       this.windows.setMatrixAt(count++, this.object.matrix);
       if (count >= this.limit) break;
      }
      if (count >= this.limit) break;
     }
     if (count >= this.limit) break;
    }
    if (count >= this.limit) break;
   }
   if (count >= this.limit) break;
  }
  this.windows.count = count;
  this.windows.instanceMatrix.needsUpdate = true;
 }
 local(coordinate) {
  const point = maplibregl.MercatorCoordinate.fromLngLat(coordinate);
  return [(point.x - this.origin.x) / this.scale, (point.y - this.origin.y) / this.scale];
 }
 setVisible(visible) { this.windows.visible = visible; }
 dispose() { this.windows.geometry.dispose(); this.windows.material.dispose(); }
}
