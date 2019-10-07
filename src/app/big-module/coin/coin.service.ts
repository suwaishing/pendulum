import * as THREE from "three";
import * as CANNON from "cannon";
import GLTFLoader from "three-gltf-loader";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CoinService {
  public world: CANNON.World;
  private canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;

  private clearCoin: any[] = [];
  private loop = true;
  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private dt = 1 / 60;
  //object

  public bodies: any[] = [];
  public meshes: any[] = [];
  // private coinsToRemove: Array<{coinBody: CANNON.Body, coinMesh: THREE.Mesh}> = [];
  public loader: GLTFLoader;
  private loaderCoin: GLTFLoader;
  private boxObj: THREE.Object3D;
  private coinObj: THREE.Object3D;
  //private coinBody: CANNON.Body;
  private physicMaterial: CANNON.Material;
  private groundMaterial: CANNON.Material;
  private runResize;
  constructor() {}

  createScene(id: string) {
    this.loop = true;
    this.canvas = <HTMLCanvasElement>document.getElementById(id);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //this.renderer.setClearColor("rgb(98, 131, 149)");
    //Create scene
    this.scene = new THREE.Scene();
    //this.scene.background= new THREE.Color( "rgb(98, 131, 149)" );
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    //this.camera.position.set(8,8,0);
    this.camera.position.set(0, 6, 10);
    // this.camera.position.set(0, 15, -10);
    this.scene.add(this.camera);

    //Create Light
    let light5 = new THREE.DirectionalLight(0xf5bae3, 0.4);
    // light5.lookAt(new THREE.Vector3(0,7,10));
    light5.position.set(0, 6, 0);
    light5.castShadow = true;
    light5.shadow.radius = 1;
    this.scene.add(light5);

    let light = new THREE.PointLight(0xbfd5e5, 1, 20, 2);
    // light.lookAt(new THREE.Vector3(-3,3,0));
    light.position.set(-3, 2, 0);
    // this.scene.add(light);

    let light4 = new THREE.PointLight(0xbfd5e5, 0.6);
    // light.lookAt(new THREE.Vector3(-3,3,0));
    light4.position.set(0, 10, 0);
    // this.scene.add(light4);

    // let light2 = new THREE.HemisphereLight(0xf5bae3,0xbfd5e5,0.5);
    // light2.position.set(0,10,0);
    // this.scene.add(light2);

    let light3 = new THREE.DirectionalLight(0xf5bae3, 0.5);
    light3.position.set(0, -3, 10);
    this.scene.add(light3);

    //mouse and raycaster
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    let background = new THREE.IcosahedronGeometry(20, 1);
    let backgroundMat = new THREE.MeshStandardMaterial({
      color: 0xf7a5d1,
      roughness: 1,
      metalness: 0,
      emissive: 0x354164,
      side: THREE.BackSide
    });
    let backgroundMesh = new THREE.Mesh(background, backgroundMat);
    backgroundMesh.position.set(0, 0, 0);
    backgroundMesh.rotation.set(0, -Math.PI / 2, 0);
    backgroundMesh.position.normalize();
    this.scene.add(backgroundMesh);

    this.initCannon();
    //Create Floor
    this.createGround();

    //Load model
    this.createBox();
  }

  animate() {
    this.render();
    // this.runResize=()=>{this.resize();}
    // window.addEventListener('resize',this.runResize);

    this.canvas.addEventListener("mousedown", event => {
      this.createCoin(event);
    });
  }

  deleteEverything() {
    // window.removeEventListener('resize',this.runResize);
    this.scene = null;
    this.world = null;
    this.camera = null;
    this.loader = null;
    //this.loop=false;
    this.renderer = null;
    this.bodies.length = 0;
    this.meshes.length = 0;
    this.loop = false;
    this.coinObj = null;
    this.boxObj = null;

    for (let i = 0; i < this.clearCoin.length; i++) {
      clearTimeout(this.clearCoin[i]);
    }
    this.clearCoin.length = 0;
  }

  resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  render() {
    if (this.loop) {
      requestAnimationFrame(() => {
        this.render();
      });
      this.resize();
      this.world.step(this.dt);
      // Update positions

      for (var i = 0; i < this.meshes.length; i++) {
        this.meshes[i].position.copy(this.bodies[i].position);
        this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    const ww = window.innerWidth;

    if (this.resizeRendererToDisplaySize(this.renderer)) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  initCannon() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);
    //this.world.broadphase=new CANNON.NaiveBroadphase();

    //ground material
    this.groundMaterial = new CANNON.Material();

    //ball material
    this.physicMaterial = new CANNON.Material();

    var ball_ground = new CANNON.ContactMaterial(
      this.groundMaterial,
      this.physicMaterial,
      { friction: 0.3, restitution: 0.3 }
    );
    this.world.addContactMaterial(ball_ground);
    this.initCoin();
  }

  createGround() {
    //Graphics
    let floorGeo = new THREE.PlaneGeometry(100, 100, 25, 25);
    floorGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    let material = new THREE.ShadowMaterial({
      transparent: true,
      opacity: 0.1
    });
    //material.transparent= true;

    let mesh = new THREE.Mesh(floorGeo, material);
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    //Physics
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({
      mass: 0,
      material: this.groundMaterial
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    this.world.addBody(groundBody);
  }

  createBox() {
    //Physics
    let body = new CANNON.Body({ mass: 10, material: this.groundMaterial });
    body.position.set(0, 0, 0);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);

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
    let quat = new CANNON.Quaternion(0, 0.7071, 0, 0.7071);
    quat.normalize();
    body.addShape(column, new CANNON.Vec3(0, 2.125, -1.475), quat);
    body.addShape(column, new CANNON.Vec3(0, 2.125, -1.095), quat);
    body.addShape(column, new CANNON.Vec3(0, 2.125, -0.7), quat);
    body.addShape(column, new CANNON.Vec3(0, 2.125, -0.31), quat);
    body.addShape(column, new CANNON.Vec3(0, 2.125, 0.1), quat);
    body.addShape(column, new CANNON.Vec3(0, 2.125, 0.555), quat);
    body.addShape(column, new CANNON.Vec3(0, 2.125, 1.01), quat);
    body.addShape(column, new CANNON.Vec3(0, 2.125, 1.47), quat);

    let shape4 = new CANNON.Box(new CANNON.Vec3(0.15, 0.11, 2.1));
    body.addShape(shape4, new CANNON.Vec3(-1.043, 2.117, 0));
    body.addShape(shape4, new CANNON.Vec3(1.043, 2.117, 0));

    let shape5 = new CANNON.Box(new CANNON.Vec3(1.08, 0.11, 0.157));
    body.addShape(shape5, new CANNON.Vec3(0, 2.117, 1.938));
    body.addShape(shape5, new CANNON.Vec3(0, 2.117, -1.938));

    this.bodies.push(body);

    this.world.addBody(body);

    //Graphics
    let boxMat = new THREE.MeshStandardMaterial({
      color: 0x190b02,
      roughness: 0.4,
      metalness: 0.4,
      emissive: 0x190b00
    });
    this.loader = new GLTFLoader();
    this.loader.load("assets/saisen4.glb", gltf => {
      this.boxObj = gltf.scene;
      this.boxObj.children["0"].receiveShadow = true;
      this.boxObj.children["0"].castShadow = true;
      this.boxObj.children["0"].children["0"].receiveShadow = true;
      this.boxObj.children["0"].children["0"].castShadow = true;
      this.boxObj.children["0"].children["0"].material.copy(boxMat);
      this.meshes.push(this.boxObj);
      this.scene.add(this.boxObj);
      this.camera.lookAt(this.boxObj.position);

      //   thing.traverse( function( node ) {
      //     if ( node instanceof THREE.Mesh ) { node.castShadow = true; }
      // } );
    });
  }

  initCoin() {
    //Physics
    // let coinShape = new CANNON.Cylinder(.15, .15, 0.0096, 32);
    // this.coinBody = new CANNON.Body({ mass: 0.1, material: this.physicMaterial });
    // let quat = new CANNON.Quaternion(0.7071, 0,0, 0.7071);
    // quat.normalize();
    // this.coinBody.addShape(coinShape, new CANNON.Vec3, quat);
    // //this.coinBody.position.set(-3, 5, 0);

    //Graphics
    let coinMat = new THREE.MeshStandardMaterial({
      color: 0xcec721,
      emissive: 0x595000,
      roughness: 0.41,
      metalness: 0.68
    });
    this.loaderCoin = new GLTFLoader();
    this.loaderCoin.load("assets/coinv3.glb", gltf => {
      this.coinObj = gltf.scene;
      this.coinObj.scale.set(0.12, 0.12, 0.12);
      this.coinObj.children["0"].material.copy(coinMat);
    });
  }

  createCoin(event) {
    let cloneMesh = new THREE.Object3D();
    cloneMesh = this.coinObj.clone();

    let coinShape = new CANNON.Cylinder(0.15, 0.15, 0.03, 12);
    let coinBody = new CANNON.Body({
      mass: 0.1,
      material: this.physicMaterial
    });
    let quat = new CANNON.Quaternion(0.7071, 0, 0, 0.7071);
    quat.normalize();
    coinBody.addShape(coinShape, new CANNON.Vec3(), quat);

    this.world.add(coinBody);
    this.bodies.push(coinBody);

    this.scene.add(cloneMesh);
    this.meshes.push(cloneMesh);

    let shootVelo = 7;
    let shootPosition = new THREE.Vector3();
    shootPosition = this.throwPosition(event);
    let shootDirection = new THREE.Vector3(0, 10, 0);
    var ray = new THREE.Ray(
      shootPosition,
      shootDirection.sub(shootPosition).normalize()
    );
    shootDirection.copy(ray.direction);
    shootPosition.add(shootDirection);
    coinBody.velocity.set(
      shootDirection.x * shootVelo,
      shootDirection.y * shootVelo,
      shootDirection.z * shootVelo
    );
    coinBody.position.copy(shootPosition);
    cloneMesh.position.copy(shootPosition);

    this.clearCoin.push(
      setTimeout(() => {
        //const index = this.meshes.indexOf(coinMesh);
        this.world.remove(coinBody);
        this.scene.remove(cloneMesh);
        cloneMesh.remove();
        this.meshes.splice(1, 1);
        this.bodies.splice(1, 1);
      }, 10000)
    );
  }

  throwPosition(e) {
    e.preventDefault();

    this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let dropPoint = new THREE.Vector3();
    dropPoint.copy(this.camera.position);
    if (intersects.length > 0) dropPoint.copy(intersects[0].point);

    return dropPoint;
  }
}
