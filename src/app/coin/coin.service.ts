import * as THREE from "three";
import * as CANNON from 'cannon';
import GLTFLoader from 'three-gltf-loader';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoinService {
  private world: CANNON.World;
  private canvas:HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private light2: THREE.PointLight;
  private light3: THREE.PointLight;
  private light4: THREE.PointLight;
  private light5: THREE.PointLight;

  
  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private dt=1/60;
  //object

  private coins:any[]=[];
  private coinMeshes:any[]=[];
  private floorGeo: THREE.PlaneGeometry;
  private material: THREE.MeshLambertMaterial;
  private coinMaterial: THREE.MeshMatcapMaterial;
  private mesh: THREE.Mesh;
  private loader: GLTFLoader;
  private physicMaterial:CANNON.Material; 
  constructor() { }

  createScene(id: string) {
    this.initCannon();
    this.canvas =<HTMLCanvasElement>document.getElementById(id);

    this.renderer= new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth,window.innerHeight);
    //this.renderer.setClearColor(0xffffff);
    //Create scene
    this.scene=new THREE.Scene();

    this.camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,.1,1000);
    //this.camera.position.set(8,8,0);
    this.camera.position.set(8,8,-1);
    this.scene.add(this.camera);

    //Create Light
    this.light=new THREE.AmbientLight(0x404040);
    this.light.position.z=10;
    this.scene.add(this.light);

    this.light2 = new THREE.PointLight(0xc4c4c4, 5);
    this.light2.position.set(0, 300, 500);
    this.scene.add(this.light2);

    this.light3 = new THREE.PointLight(0xc4c4c4, 5);
    this.light3.position.set(500, 100, 0);
    this.scene.add(this.light3);

    this.light4 = new THREE.PointLight(0xc4c4c4, 1);
    this.light4.position.set(0, 100, -500);
    this.scene.add(this.light4);

    this.light5 = new THREE.PointLight(0xc4c4c4, 1);
    this.light5.position.set(-500, 300, 0);
    this.scene.add(this.light5);

    //Create Floor
    this.floorGeo=new THREE.PlaneGeometry(300,300,50,50);
    this.floorGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

    this.material = new THREE.MeshLambertMaterial( { color: 0x11111 } );
    this.coinMaterial = new THREE.MeshMatcapMaterial({color:0xDFB048});
    this.mesh = new THREE.Mesh(this.floorGeo,this.material);
    this.scene.add(this.mesh);
    
    //Load model
    this.loader = new GLTFLoader();
    this.loader.load(
      'assets/saisen.glb',
      (gltf)=>{
        let thing = gltf.scene;
        this.scene.add(thing);
          this.camera.lookAt(thing.position);
      }
    )

  }

  animate(){
    window.addEventListener('DOMContentLoaded',()=>{
      this.render();
    })

    window.addEventListener('resize',()=>{
      this.resize();
    })
    window.addEventListener('mousedown',(event)=>{
      
      //console.log(intersects[ 0 ]);
      // if ( intersects.length > 0 ) {
      //   if ( this.INTERSECTED != intersects[ 0 ].object ) {
      //     if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
      //     this.INTERSECTED = intersects[ 0 ].object;
      //     this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
      //     this.INTERSECTED.material.emissive.setHex( 0xff0000 );
      //     console.log(intersects.length);
      //   }
      // } else {
      //   if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
      //   this.INTERSECTED = null;
      // }
      var coinShape = new CANNON.Cylinder(size,size,size*.2,16);
      var size=.1;
      var coinGeometry = new THREE.CylinderGeometry(size,size,size*.2 , 16);
      var coinMesh = new THREE.Mesh( coinGeometry, this.coinMaterial );

      var coinBody = new CANNON.Body({ mass: 1, material:this.physicMaterial });
      var quat = new CANNON.Quaternion();
      quat.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI/2);
      coinShape.transformAllPoints(new CANNON.Vec3(),quat);
      coinBody.addShape(coinShape);

      var dropPoint =new THREE.Vector3();
      dropPoint.copy(this.getClicked3DPoint(event));
      var shootDirection = new THREE.Vector3(0,10,0);
      var shootVelo =2;
      var x = dropPoint.x;
      var y = dropPoint.y;
      var z = dropPoint.z;
      var ray = new THREE.Ray(dropPoint, shootDirection.sub(dropPoint).normalize() );

      
      shootDirection.copy(ray.direction);
      coinBody.velocity.set(shootDirection.x*shootVelo,shootDirection.y*shootVelo,shootDirection.z*shootVelo);

      this.world.addBody(coinBody);
      this.scene.add(coinMesh);
      this.coins.push(coinBody);
      this.coinMeshes.push(coinMesh);

      

      x+=shootDirection.x;
      y+=shootDirection.y;
      z+=shootDirection.z;
      coinBody.position.set(x,y,z);
      coinMesh.position.set(x,y,z);
    })
  }

  render(){
    requestAnimationFrame(()=>{
      this.render();
    });
    this.world.step(this.dt);

    // Update ball positions
    for (var i = 0; i < this.coins.length; i++) {
      this.coinMeshes[i].position.copy(this.coins[i].position);
      this.coinMeshes[i].quaternion.copy(this.coins[i].quaternion);
    }

  
    //this.cube.rotation.x+=.01;
    //this.cube.rotation.y+=.01;
    this.renderer.render(this.scene,this.camera);
  }

  resize(){
    this.camera.aspect=window.innerWidth/window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth,window.innerHeight);
  }

  initCannon(){
    this.world=new CANNON.World();
    this.world.gravity.set(0,-10,0);
    //this.world.broadphase=new CANNON.NaiveBroadphase();

    this.physicMaterial = new CANNON.Material();
    this.physicMaterial.friction=.3;
    this.physicMaterial.restitution=.1;

    // Create a plane
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    this.world.addBody(groundBody);



    // shoot ball
    
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

            
  }

  getClicked3DPoint(e) {
    e.preventDefault();

    this.mouse.x = ( e.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
    this.mouse.y = - ( e.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0)
        return intersects[0].point;
    
  };
  createCoin(){
    var coinShape = new CANNON.Cylinder(size,size,size*.2,16);
    var size=.1;
    var coinGeometry = new THREE.CylinderGeometry(size,size,size*.2 , 16);
    var coinMesh = new THREE.Mesh( coinGeometry, this.coinMaterial );

    var coinBody = new CANNON.Body({ mass: 1, material:this.physicMaterial });
    var quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI/2);
    coinShape.transformAllPoints(new CANNON.Vec3(),quat);
    coinBody.addShape(coinShape);

    this.world.addBody(coinBody);
    this.scene.add(coinMesh);
    this.coins.push(coinBody);
    this.coinMeshes.push(coinMesh);
    
  }


}
