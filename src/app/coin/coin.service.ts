import * as THREE from "three";
import * as CANNON from "cannon";
import GLTFLoader from 'three-gltf-loader';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CoinService {
  private world: CANNON.World;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private dt = 1 / 60;
  //object

  private bodies: any[] = [];
  private meshes: any[] = [];
  // private coinsToRemove: Array<{coinBody: CANNON.Body, coinMesh: THREE.Mesh}> = [];
  private mesh: THREE.Mesh;
  private loader: GLTFLoader;
  private physicMaterial: CANNON.Material;
  private groundMaterial: CANNON.Material;
  constructor() { }

  createScene(id: string) {

    this.canvas = <HTMLCanvasElement>document.getElementById(id);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //this.renderer.setClearColor("rgb(98, 131, 149)");
    //Create scene
    this.scene = new THREE.Scene();
    //this.scene.background= new THREE.Color( "rgb(98, 131, 149)" );
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000);
    //this.camera.position.set(8,8,0);
    this.camera.position.set(8, 8, 0);
    this.scene.add(this.camera);

    //Create Light
    let light = new THREE.HemisphereLight( 0x6b00b2,0x99fff8, 2 );
    light.position.y = 10;
    this.scene.add(light);

    let light2 = new THREE.PointLight(0xf1fb40,2);
    light2.position.set(5, 10, 5);
    light2.castShadow = true;
    this.scene.add(light2);

    // var spotLight = new THREE.RectAreaLight(0xffffff,5,4,2);
    // spotLight.position.set(5,5,-5);
    // this.scene.add(spotLight);

    let light3 = new THREE.PointLight(0xf1fb40,2);
    light3.position.set(5, 10, -6);
    this.scene.add(light3);

    let light4 = new THREE.PointLight(0xc4c4c4, 2);
    light4.position.set(7, -7, 3);
    this.scene.add(light4);

    let light5 = new THREE.PointLight(0xc4c4c4, 2);
    light5.position.set(7, -8, -2);
    this.scene.add(light5);

    //mouse and raycaster
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.initCannon();
    //Create Floor
    this.createGround();

    //Load model
    this.createBox();

  }

  animate() {
    window.addEventListener('DOMContentLoaded', () => {
      this.render();
    })

    window.addEventListener('resize', () => {
      this.resize();
    })

    window.addEventListener('mousedown', (event) => {
      this.createCoin(event);
    })

  }


  render() {
    requestAnimationFrame(() => {
      this.render();

    });
    this.world.step(this.dt);

    // Update positions

    for (var i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position.copy(this.bodies[i].position);
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  initCannon() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);
    //this.world.broadphase=new CANNON.NaiveBroadphase();

    //ground material
    this.groundMaterial = new CANNON.Material();

    //ball material
    this.physicMaterial = new CANNON.Material();

    var ball_ground = new CANNON.ContactMaterial(this.groundMaterial, this.physicMaterial, { friction: 0.3, restitution: 0.3 });
    this.world.addContactMaterial(ball_ground);

  }

  createGround() {
    //Graphics
    let floorGeo = new THREE.PlaneGeometry(100, 100, 25, 25);
    floorGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    let material = new THREE.MeshStandardMaterial();
    material.color= new THREE.Color(0xBA4859);
    //material.color= new THREE.Color(0xffffff);

    this.mesh = new THREE.Mesh(floorGeo, material);
    this.scene.add(this.mesh);

    //Physics
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0, material: this.groundMaterial });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
  }

  createBox() {
    //Physics
    let body = new CANNON.Body({ mass: 10, material: this.groundMaterial });
    //body.position.set(0, 1, 0);
    // body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

    // Use a box shape as child shape
    let shape = new CANNON.Box(new CANNON.Vec3(1.101, 0.126, 2.01));
    body.addShape(shape, new CANNON.Vec3(0, 0.125, 0));

    let shape2 = new CANNON.Box(new CANNON.Vec3(0.05, 1.1, 1.9));
    body.addShape(shape2, new CANNON.Vec3(-0.96, 1.1, 0));
    body.addShape(shape2, new CANNON.Vec3(0.96, 1.1, 0));

    let shape3 = new CANNON.Box(new CANNON.Vec3(0.9, 1.1, 0.035));
    body.addShape(shape3, new CANNON.Vec3(0, 1.1, 1.865));
    body.addShape(shape3, new CANNON.Vec3(0, 1.1, -1.865));

    let column = new CANNON.Cylinder(0.1, 0.1, 1.8, 4);
    body.addShape(column, new CANNON.Vec3(0, 2.125, -1.475), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));
    body.addShape(column, new CANNON.Vec3(0, 2.125, -1.095), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));
    body.addShape(column, new CANNON.Vec3(0, 2.125, -0.7), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));
    body.addShape(column, new CANNON.Vec3(0, 2.125, -0.31), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));
    body.addShape(column, new CANNON.Vec3(0, 2.125, 0.1), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));
    body.addShape(column, new CANNON.Vec3(0, 2.125, 0.555), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));
    body.addShape(column, new CANNON.Vec3(0, 2.125, 1.01), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));
    body.addShape(column, new CANNON.Vec3(0, 2.125, 1.47), new CANNON.Quaternion(0, 0.7071, 0, 0.7071));

    let shape4 = new CANNON.Box(new CANNON.Vec3(0.15, 0.11, 2.1));
    body.addShape(shape4, new CANNON.Vec3(-1.043, 2.117, 0));
    body.addShape(shape4, new CANNON.Vec3(1.043, 2.117, 0));

    let shape5 = new CANNON.Box(new CANNON.Vec3(1.08, 0.11, 0.157));
    body.addShape(shape5, new CANNON.Vec3(0, 2.117, 1.938));
    body.addShape(shape5, new CANNON.Vec3(0, 2.117, -1.938));

    this.bodies.push(body);

    this.world.addBody(body);

    //Graphics
    this.loader = new GLTFLoader();
    this.loader.load(
      'assets/saisen2.glb',
      (gltf) => {
        let thing = gltf.scene;
        this.meshes.push(thing);
        this.scene.add(thing);
        this.camera.lookAt(thing.position);
        thing.traverse( function( node ) {
          if ( node instanceof THREE.Mesh ) { node.castShadow = true; }
      } );
  

      }
    )
  }

  createCoin(event) {
    let size = .12;
    //Physics
    let coinShape = new CANNON.Cylinder(size, size, size * .2, 16);
    let coinBody = new CANNON.Body({ mass: 0.1, material: this.physicMaterial });
    let quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    coinShape.transformAllPoints(new CANNON.Vec3(), quat);
    coinBody.addShape(coinShape);
    this.world.addBody(coinBody);
    this.bodies.push(coinBody);

    //Graphics
    let coinGeo = new THREE.CylinderGeometry(size, size, size * .2, 16);
    let material = new THREE.MeshPhongMaterial({ color: 0xdbe51b });
    let coinMesh = new THREE.Mesh(coinGeo, material);
    this.scene.add(coinMesh);
    this.meshes.push(coinMesh);

    // throw coin trajectory
    let shootVelo = 7;
    let shootPosition = new THREE.Vector3();
    shootPosition = this.throwPosition(event);
    let shootDirection = new THREE.Vector3(0, 10, 0);
    var ray = new THREE.Ray(shootPosition, shootDirection.sub(shootPosition).normalize());
    shootDirection.copy(ray.direction);
    shootPosition.add(shootDirection);
    coinBody.velocity.set(shootDirection.x * shootVelo, shootDirection.y * shootVelo, shootDirection.z * shootVelo);
    coinBody.position.copy(shootPosition);
    coinMesh.position.copy(shootPosition);

    setTimeout(() => {
      //const index = this.meshes.indexOf(coinMesh);
      this.world.remove(coinBody);
      this.scene.remove(coinMesh);
      coinGeo.dispose();
      material.dispose();
      coinMesh = undefined;
      this.meshes.splice(1, 1);
      this.bodies.splice(1, 1);
    }, 10000);

  }

  throwPosition(e) {
    e.preventDefault();

    this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = - (e.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let dropPoint = new THREE.Vector3();
    dropPoint.copy(this.camera.position)
    if (intersects.length > 0)
      dropPoint.copy(intersects[0].point);

    return dropPoint;
  }


}
