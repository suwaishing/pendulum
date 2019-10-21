import * as THREE from "three";
import * as CANNON from "cannon";
import * as OrbitControls from "three-orbitcontrols";
import * as gs from "gsap";
import * as dat from "dat.gui";
import GLTFLoader from "three-gltf-loader";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class PendulumService {
  private world: CANNON.World;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private times = [];
  private fps: number;
  private now: number;
  private bodies: any[] = [];
  private meshes: any[] = [];
  private physicMaterial: CANNON.Material;
  private loadingManager: THREE.LoadingManager;
  RESOURCE_LOADED = false;
  private clearScene: any[] = [];
  private clearWorld: any[] = [];
  private gui: dat.GUI;
  private gui2: dat.GUI;
  //pendulum parameters
  private controls: OrbitControls;
  private dragControl;
  private balls: any[] = [];
  private lastBallsMesh: any[] = [];
  private isDrag = false;

  //coin parameters
  private clearCoin: any[] = [];
  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  public loader: GLTFLoader;
  private loaderCoin: GLTFLoader;
  private boxObj;
  private cloneBox;
  public coinObj: THREE.Scene;
  private groundMaterial: CANNON.Material;
  private coinMat: THREE.MeshStandardMaterial;
  private boxMat: THREE.MeshStandardMaterial;

  //transition parameter
  private isScene1 = true;
  loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    ),
    tetra: {
      mesh: new THREE.Mesh(
        new THREE.TetrahedronBufferGeometry(0.4, 0),
        new THREE.MeshPhongMaterial({
          color: 0x984375,
          emissive: 0x984375,
          flatShading: true
        })
      ),
      group: new THREE.Group()
    },
    ico: {
      mesh: new THREE.Mesh(
        new THREE.IcosahedronBufferGeometry(0.4, 0),
        new THREE.MeshPhongMaterial({
          color: 0x4c7acb,
          emissive: 0x4c7acb,
          flatShading: true
        })
      ),
      group: new THREE.Group()
    },
    octa: {
      mesh: new THREE.Mesh(
        new THREE.OctahedronBufferGeometry(0.4, 0),
        new THREE.MeshPhongMaterial({
          color: 0x7f2e41,
          emissive: 0x7f2e41,
          flatShading: true
        })
      ),
      group: new THREE.Group()
    }
  };
  constructor() {}

  createScene(id: string) {
    this.canvas = <HTMLCanvasElement>document.getElementById(id);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });

    //Create scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    //Init GUI
    this.gui = new dat.GUI();

    this.scene.add(this.camera);
    // Init loading Scene
    this.loadingScreen.scene.background = new THREE.Color(0xdecd8a);
    this.addOutline(
      this.loadingScreen.tetra.mesh,
      this.loadingScreen.tetra.group
    );
    this.loadingScreen.tetra.group.position.set(0, 0, 5);
    this.loadingScreen.camera.lookAt(this.loadingScreen.tetra.group.position);

    this.addOutline(this.loadingScreen.ico.mesh, this.loadingScreen.ico.group);
    this.loadingScreen.ico.group.position.set(-1, 0, 5);

    this.addOutline(
      this.loadingScreen.octa.mesh,
      this.loadingScreen.octa.group
    );
    this.loadingScreen.octa.group.position.set(1, 0, 5);

    //Scene 1
    this.loadingManager = new THREE.LoadingManager();
    this.initCannon();
    this.initModels();
    //Scene 2
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.dragControl = new DragControls(
      this.balls,
      this.camera,
      this.renderer.domElement
    );
  }
  addOutline(_Mesh: THREE.Mesh, _Group: THREE.Group) {
    // const edges = new THREE.EdgesGeometry(_geometry);
    const geometry = _Mesh.geometry;
    const line = new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x000,
        opacity: 0.5,
        transparent: true
      })
    );
    _Group.add(line);
    _Group.add(_Mesh);
    this.loadingScreen.scene.add(_Group);
  }
  initScene1() {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //Create Light
    const Light1 = {
      color: 0xbfd5e5,
      intensity: 5,
      distance: 22,
      decay: 1,
      x: 0,
      y: -1,
      z: 18
    };
    const Light2 = {
      color: 0xebebeb,
      intensity: 2.28,
      x: 0,
      y: -8.8,
      z: -5,
      castShadow: true
    };
    const Light3 = {
      color: 0xf5bae3,
      intensity: 0.85,
      x: 0,
      y: -4,
      z: 5,
      castShadow: false
    };
    const BackGround = {
      color: 0x823c61,
      emissive: 0x3e389d
    };
    let light = new THREE.PointLight(
      Light1.color,
      Light1.intensity,
      Light1.distance,
      Light1.decay
    );
    light.position.set(Light1.x, Light1.y, Light1.z);
    this.clearScene.push(light.uuid);
    this.scene.add(light);
    this.guiPointLight(this.gui, "PointLight", Light1, light);

    let light2 = new THREE.DirectionalLight(Light2.color, Light2.intensity);
    light2.position.set(Light2.x, Light2.y, Light2.z);
    light2.castShadow = Light2.castShadow;
    light2.shadow.radius = 1;
    this.clearScene.push(light2.uuid);
    this.scene.add(light2);
    this.guiDirectLight(this.gui, "Directionlight 1", Light2, light2);

    let light3 = new THREE.DirectionalLight(Light3.color, Light3.intensity);
    light3.position.set(Light3.x, Light3.y, Light3.z);
    this.clearScene.push(light3.uuid);
    this.scene.add(light3);
    this.guiDirectLight(this.gui, "Directionlight 2", Light3, light3);

    //Camera
    this.camera.position.set(0, 6, 12);
    //mouse and raycaster
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    let background = new THREE.IcosahedronBufferGeometry(20, 1);
    let backgroundMat = new THREE.MeshLambertMaterial({
      color: BackGround.color,
      emissive: BackGround.emissive,
      side: THREE.BackSide
    });

    let backgroundMesh = new THREE.Mesh(background, backgroundMat);
    backgroundMesh.position.set(0, 0, 0);
    backgroundMesh.rotation.set(0, -Math.PI / 2, 0);
    backgroundMesh.position.normalize();
    this.guiLambertMat(this.gui, "Background", BackGround, backgroundMat);
    this.clearScene.push(backgroundMesh.uuid);
    this.scene.add(backgroundMesh);

    //Create Floor
    this.createGround1();
  }

  initScene2() {
    const Light1 = {
      color: 0xf48642,
      intensity: 5,
      distance: 20,
      decay: 2,
      x: 0,
      y: 10,
      z: 0
    };
    const Light2 = {
      color: 0xf97c66,
      intensity: 5,
      distance: 20,
      decay: 2,
      x: 0,
      y: -10,
      z: 0
    };
    const Light3 = {
      skyColor: 0xf9690e,
      groundColor: 0xff6347,
      intensity: 0.7,
      x: 0,
      y: 10,
      z: 0
    };
    //Create Light
    let light = new THREE.PointLight(
      Light1.color,
      Light1.intensity,
      Light1.distance,
      Light1.decay
    );
    light.position.set(Light1.x, Light1.y, Light1.z);
    this.guiPointLight(this.gui, "PointLight 1", Light1, light);
    this.clearScene.push(light.uuid);
    this.scene.add(light);

    let light2 = new THREE.PointLight(
      Light2.color,
      Light2.intensity,
      Light2.distance,
      Light2.decay
    );
    light2.position.set(Light2.x, Light2.y, Light2.z);
    this.guiPointLight(this.gui, "PointLight 2", Light2, light2);
    this.clearScene.push(light2.uuid);
    this.scene.add(light2);

    let light3 = new THREE.HemisphereLight(
      Light3.skyColor,
      Light3.groundColor,
      Light3.intensity
    );
    light3.position.set(Light3.x, Light3.y, Light3.z);
    this.guiHemiLight(this.gui, "HemisphereLight", Light3, light3);
    this.clearScene.push(light3.uuid);
    this.scene.add(light3);

    //Create Floor
    this.createGround2();

    //Load model
    let penNum = 5;
    let start = -2;
    const RopeMat = {
      color: 0x3d59fb,
      emissive: 0x000
    };
    const BallMat = {
      color: 0x8092f7,
      emissive: 0x000,
      roughness: 0.5,
      metalness: 0.6
    };
    let ropeMat = new THREE.MeshLambertMaterial({
      color: RopeMat.color,
      emissive: RopeMat.emissive
    });
    let ballMat = new THREE.MeshStandardMaterial({
      color: BallMat.color,
      emissive: BallMat.emissive,
      roughness: BallMat.roughness,
      metalness: BallMat.metalness
    });
    this.guiLambertMat(this.gui, "Rope", RopeMat, ropeMat);
    this.guiMaterial(this.gui, "Ball", BallMat, ballMat);

    for (let i = 0; i < penNum; i++) {
      this.addSphereChain(start + i, ropeMat, ballMat);
    }

    this.controls.enabled = true;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.5;
    this.dragControl.activate();
  }

  animate() {
    this.render();
  }

  switchScene() {
    this.isScene1 = !this.isScene1;
    this.bodies.map(body => {
      if (body instanceof CANNON.Body) {
        gs.TweenLite.to(body.position, 2.5, {
          x: body.position.x,
          y: body.position.y + 20,
          z: body.position.z,
          ease: gs.Power3.easeIn
        });
      }
    });

    setTimeout(() => {
      this.clearSceneWorld();
      this.clearGUI();
      if (this.isScene1) {
        this.disableScene2();
        this.runScene1();
      } else {
        this.disableScene1();
        this.runScene2();
      }
    }, 2500);
  }
  clearSceneWorld() {
    //Clear World
    this.clearWorld.map(body => {
      if (body instanceof CANNON.Body) {
        this.world.removeBody(body);
      } else {
        this.world.removeConstraint(body);
      }
    });
    this.clearWorld.length = 0;
    //Clear Scene
    this.clearScene.map(uuid => {
      const object = this.scene.getObjectByProperty("uuid", uuid);
      this.scene.remove(object);
    });
    this.clearScene.length = 0;
  }

  clearGUI() {
    let items = Object.keys(this.gui.__folders);
    items.map(key => {
      let value = this.gui.__folders[key];
      this.gui.removeFolder(value);
    });
  }
  async runScene1() {
    this.isScene1 = true;
    this.initScene1();

    if (this.RESOURCE_LOADED === false) {
      await this.firstInitCoinAndBox();

      this.loadingManager.onLoad = () => {
        setTimeout(() => {
          this.RESOURCE_LOADED = true;
        }, 3000);
        this.initGuiMaterial();
        this.createBox();
        this.canvas.addEventListener("mousedown", this.createCoin, false);
      };
    } else {
      this.initGuiMaterial();
      this.createBox();
      this.canvas.addEventListener("mousedown", this.createCoin, false);
    }
  }

  async initGuiMaterial() {
    const CoinMat = {
      color: 0xcec721,
      emissive: 0x595000,
      roughness: 0.41,
      metalness: 0.68
    };
    const BoxMat = {
      color: 0x190b02,
      emissive: 0x190b00,
      roughness: 0.62,
      metalness: 0.43
    };
    //box Material
    this.cloneBox = this.boxObj.clone();
    this.boxMat = new THREE.MeshStandardMaterial(BoxMat);
    await this.guiMaterial(
      this.gui,
      "Box Material",
      BoxMat,
      this.boxMat,
      this.cloneBox
    );

    //Coin Material
    this.coinMat = new THREE.MeshStandardMaterial(CoinMat);
    await this.guiMaterial(
      this.gui,
      "Coin Material",
      CoinMat,
      this.coinMat,
      this.coinObj
    );
  }
  firstInitCoinAndBox() {
    let tl = new gs.TimelineLite();
    tl.to(this.loadingScreen.octa.group.scale, 1, {
      x: 0.00001,
      y: 0.00001,
      z: 0.00001,
      ease: gs.Power2.easeIn
    });

    tl.to(this.loadingScreen.tetra.group.scale, 0.5, {
      x: 0.00001,
      y: 0.00001,
      z: 0.00001,
      ease: gs.Power2.easeIn,
      onComplete: () => {
        this.loadingScreen.scene.background = new THREE.Color(0xe58463);
      }
    });
    tl.to(this.loadingScreen.ico.group.scale, 0.5, {
      x: 0.00001,
      y: 0.00001,
      z: 0.00001,
      ease: gs.Power2.easeIn,
      onComplete: () => {
        this.loadingScreen.scene.background = new THREE.Color(0xb381c7);
      }
    });
    return tl.play();
  }

  runScene2() {
    this.isScene1 = false;
    this.initScene2();
    this.dragControl.addEventListener("dragstart", () => {
      this.controls.enabled = false;
      this.isDrag = true;
    });

    this.dragControl.addEventListener("dragend", () => {
      this.controls.enabled = true;
      this.isDrag = false;
    });
  }
  disableScene1() {
    this.canvas.removeEventListener("mousedown", this.createCoin, false);
    // this.world.bodies.for
    this.bodies.length = 0;
    this.meshes.length = 0;
    for (let i = 0; i < this.clearCoin.length; i++) {
      clearTimeout(this.clearCoin[i]);
    }
    this.clearCoin.length = 0;
  }
  disableScene2() {
    this.controls.enabled = false;
    this.dragControl.deactivate();
    // this.world = {};
    this.bodies.length = 0;
    this.meshes.length = 0;
    this.balls.length = 0;
    this.lastBallsMesh.length = 0;
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
    this.now = performance.now();

    if (this.times.length > 0 && this.times[0] <= this.now - 1000) {
      this.times.shift();
    }

    this.times.push(this.now);
    this.fps = 1 / this.times.length;
    if (!this.RESOURCE_LOADED) {
      requestAnimationFrame(() => {
        this.render();
      });
      //animate stuff
      this.loadingScreen.tetra.group.rotation.x += 0.008;
      this.loadingScreen.tetra.group.rotation.y += 0.015;
      this.loadingScreen.ico.group.rotation.x -= 0.006;
      this.loadingScreen.ico.group.rotation.y -= 0.01;
      this.loadingScreen.octa.group.rotation.x += 0.007;
      this.loadingScreen.octa.group.rotation.y -= 0.015;

      this.renderer.render(this.loadingScreen.scene, this.loadingScreen.camera);
      this.resize();
      return;
    }
    requestAnimationFrame(() => {
      this.render();
    });
    this.resize();
    this.world.step(this.fps);

    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position.copy(this.bodies[i].position);
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    }

    //for pendulum only
    if (!this.isScene1) {
      for (let i = 0; i < this.lastBallsMesh.length; i++) {
        const lastBall = this.lastBallsMesh[i];
        let start = this.meshes[lastBall].position;
        let end = this.balls[i].position;
        let distance = start.distanceTo(end).toFixed(1);
        parseFloat(distance);
        if (this.isDrag && distance > 0.1) {
          this.draggingBall(start, end, lastBall);
        } else {
          this.balls[i].position.copy(this.bodies[lastBall].position);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  initCannon() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);
    //this.world.broadphase=new CANNON.NaiveBroadphase();

    //ball material
    this.physicMaterial = new CANNON.Material();
    this.groundMaterial = new CANNON.Material();

    let ball_ball = new CANNON.ContactMaterial(
      this.physicMaterial,
      this.physicMaterial,
      { friction: 0.9, restitution: 0.9 }
    );
    let coin_ground = new CANNON.ContactMaterial(
      this.groundMaterial,
      this.physicMaterial,
      { friction: 0.3, restitution: 0.3 }
    );

    this.world.addContactMaterial(ball_ball);
    this.world.addContactMaterial(coin_ground);
  }
  guiDirectLight(
    _gui: dat.GUI,
    _folderName: String,
    _object: any,
    _light: THREE.DirectionalLight
  ) {
    let folder = _gui.addFolder(_folderName);
    folder.addColor(_object, "color").onChange(() => {
      _light.color.set(_object.color);
    });
    folder.add(_object, "intensity", 0, 5).onChange(() => {
      _light.intensity = _object.intensity;
    });
    folder.add(_object, "x", -20, 20).onChange(() => {
      _light.position.x = _object.x;
    });
    folder.add(_object, "y", -20, 20).onChange(() => {
      _light.position.y = _object.y;
    });
    folder.add(_object, "z", -20, 20).onChange(() => {
      _light.position.z = _object.z;
    });
  }
  guiPointLight(
    _gui: dat.GUI,
    _folderName: String,
    _object: any,
    _light: THREE.PointLight
  ) {
    let folder = _gui.addFolder(_folderName);
    folder.addColor(_object, "color").onChange(() => {
      _light.color.set(_object.color);
    });
    folder.add(_object, "intensity", 0, 5).onChange(() => {
      _light.intensity = _object.intensity;
    });
    folder.add(_object, "distance", 0, 25).onChange(() => {
      _light.distance = _object.distance;
    });
    folder.add(_object, "decay", 0, 2, 1).onChange(() => {
      _light.decay = _object.decay;
    });
    folder.add(_object, "x", -20, 20).onChange(() => {
      _light.position.x = _object.x;
    });
    folder.add(_object, "y", -20, 20).onChange(() => {
      _light.position.y = _object.y;
    });
    folder.add(_object, "z", -20, 20).onChange(() => {
      _light.position.z = _object.z;
    });
  }
  guiHemiLight(
    _gui: dat.GUI,
    _folderName: String,
    _object: any,
    _light: THREE.HemisphereLight
  ) {
    let folder = _gui.addFolder(_folderName);
    folder.addColor(_object, "skyColor").onChange(() => {
      _light.color.set(_object.color);
    });
    folder.addColor(_object, "groundColor").onChange(() => {
      _light.color.set(_object.color);
    });
    folder.add(_object, "intensity", 0, 5).onChange(() => {
      _light.intensity = _object.intensity;
    });
    folder.add(_object, "x", -20, 20).onChange(() => {
      _light.position.x = _object.x;
    });
    folder.add(_object, "y", -20, 20).onChange(() => {
      _light.position.y = _object.y;
    });
    folder.add(_object, "z", -20, 20).onChange(() => {
      _light.position.z = _object.z;
    });
  }
  guiLambertMat(
    _gui: dat.GUI,
    _folderName: String,
    _object: any,
    _material: THREE.MeshLambertMaterial
  ) {
    let folder = _gui.addFolder(_folderName);

    folder.addColor(_object, "color").onChange(() => {
      _material.color.set(_object.color);
    });
    folder.addColor(_object, "emissive").onChange(() => {
      _material.emissive.set(_object.emissive);
    });

    return folder;
  }
  guiPhongMat(
    _gui: dat.GUI,
    _folderName: String,
    _object: any,
    _material: THREE.MeshPhongMaterial
  ) {
    let folder = _gui.addFolder(_folderName);

    folder.addColor(_object, "color").onChange(() => {
      _material.color.set(_object.color);
    });
    folder.addColor(_object, "emissive").onChange(() => {
      _material.emissive.set(_object.emissive);
    });
    folder.add(_object, "shininess", 0, 100, 1).onChange(() => {
      _material.shininess = _object.shininess;
    });
    return folder;
  }
  guiMaterial(
    _gui: dat.GUI,
    _folderName: String,
    _object: any,
    _material: THREE.MeshStandardMaterial,
    _scene?: any
  ) {
    let folder = _gui.addFolder(_folderName);

    folder.addColor(_object, "color").onChange(() => {
      _material.color.set(_object.color);
      if (_scene) {
        _scene.children["0"].material = _material;
      }
    });
    folder.addColor(_object, "emissive").onChange(() => {
      _material.emissive.set(_object.emissive);
      if (_scene) {
        _scene.children["0"].material = _material;
      }
    });
    folder.add(_object, "roughness", 0, 1).onChange(() => {
      _material.roughness = _object.roughness;
      if (_scene) {
        _scene.children["0"].material = _material;
      }
    });
    folder.add(_object, "metalness", 0, 1).onChange(() => {
      _material.metalness = _object.metalness;
      if (_scene) {
        _scene.children["0"].material = _material;
      }
    });
    return folder;
  }

  initModels() {
    this.initBox();
    this.initCoin();
  }
  createGround1() {
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
    this.clearScene.push(mesh.uuid);
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
    this.clearWorld.push(groundBody);
    this.world.addBody(groundBody);
  }
  createGround2() {
    //let background = new THREE.IcosahedronGeometry(20);
    const BackGround = {
      color: 0xc09bef,
      emissive: 0x000000,
      shininess: 30
    };
    let background = new THREE.BoxGeometry(20, 20, 20);
    let backgroundMat = new THREE.MeshPhongMaterial({
      color: BackGround.color,
      emissive: BackGround.emissive,
      shininess: BackGround.shininess,
      side: THREE.BackSide
    });
    let backgroundMesh = new THREE.Mesh(background, backgroundMat);
    this.guiPhongMat(this.gui, "Background", BackGround, backgroundMat);
    // backgroundMesh.receiveShadow = true;
    backgroundMesh.position.set(0, 0, 0);
    backgroundMesh.rotation.set(0, -Math.PI / 2, 0);
    backgroundMesh.position.normalize();
    this.clearScene.push(backgroundMesh.uuid);
    this.scene.add(backgroundMesh);
  }

  addSphereChain(
    x: number,
    _ropeMat: THREE.MeshLambertMaterial,
    _ballMat: THREE.MeshStandardMaterial
  ) {
    let radius = 0.5;
    let quat = new CANNON.Quaternion(0.5, 0, 0, 0.5);
    quat.normalize();
    let size = 0.05;

    // Holding sphere
    let holdShape = new CANNON.Sphere(0.1);
    let holdPoint = new CANNON.Body({ mass: 0 });
    holdPoint.addShape(holdShape, new CANNON.Vec3());
    holdPoint.position.set(x, 4, 0);
    this.bodies.push(holdPoint);
    this.clearWorld.push(holdPoint);
    this.world.addBody(holdPoint);

    let sphereGeo = new THREE.SphereBufferGeometry(size, 8, 8);
    let sphereMesh = new THREE.Mesh(sphereGeo, _ropeMat);
    // this.guiLambertMat(this.gui, "Rope", RopeMat, material);
    this.meshes.push(sphereMesh);
    this.clearScene.push(sphereMesh.uuid);
    this.scene.add(sphereMesh);

    // Rope
    let ropeShape = new CANNON.Cylinder(size, size, 4, 8);
    let ropeBody = new CANNON.Body({ mass: 0.1 });
    ropeBody.addShape(ropeShape, new CANNON.Vec3(), quat);
    ropeBody.position.set(x, 2, 0);
    this.bodies.push(ropeBody);
    this.clearWorld.push(ropeBody);
    // ropeBody.angularDamping=.5;
    // ropeBody.linearDamping=.5;
    this.world.addBody(ropeBody);

    let ropeGeo = new THREE.CylinderGeometry(size, size, 4, 8, 8);
    let sphereMesh02 = new THREE.Mesh(ropeGeo, _ropeMat);
    this.meshes.push(sphereMesh02);
    this.clearScene.push(sphereMesh02.uuid);
    this.scene.add(sphereMesh02);

    let holdRope = new CANNON.PointToPointConstraint(
      holdPoint,
      new CANNON.Vec3(0, 0, 0),
      ropeBody,
      new CANNON.Vec3(0, 2, 0)
    );
    this.clearWorld.push(holdRope);
    this.world.addConstraint(holdRope);

    // Balls
    let lastBallCannon = new CANNON.Body({
      mass: 0.1,
      material: this.physicMaterial
    });
    let ballShape = new CANNON.Sphere(radius);
    lastBallCannon.addShape(ballShape);

    lastBallCannon.position.set(x, 0 - radius, 0);
    this.bodies.push(lastBallCannon);
    this.clearWorld.push(lastBallCannon);
    this.world.addBody(lastBallCannon);

    let ballGeo = new THREE.SphereGeometry(radius, 20, 20);

    let ballMesh = new THREE.Mesh(ballGeo, _ballMat);
    // this.guiMaterial(this.gui, "Ball", BallMat, ballMat);
    // ballMesh.castShadow = true;
    // ballMesh.receiveShadow = true;
    this.meshes.push(ballMesh);
    this.clearScene.push(ballMesh.uuid);
    this.scene.add(ballMesh);

    this.lastBallsMesh.push(this.meshes.indexOf(ballMesh));

    let ropeBall = new CANNON.LockConstraint(ropeBody, lastBallCannon);
    this.clearWorld.push(ropeBall);
    this.world.addConstraint(ropeBall);

    gs.TweenLite.fromTo(
      [sphereMesh.scale, sphereMesh02.scale, ballMesh.scale],
      0.5,
      {
        x: 0.0001,
        y: 0.0001,
        z: 0.0001
      },
      {
        x: 1,
        y: 1,
        z: 1
      }
    );

    // pull
    let cloneMat = new THREE.MeshBasicMaterial({
      opacity: 0,
      transparent: true
    });
    let DragBallTHREE = new THREE.Mesh(ballGeo, cloneMat);

    this.balls.push(DragBallTHREE);
    this.clearScene.push(DragBallTHREE.uuid);
    this.scene.add(DragBallTHREE);
  }

  draggingBall(start: THREE.Vector3, end: THREE.Vector3, index: number) {
    //this.world.gravity.set(this.DragBallTHREE.position.x,this.DragBallTHREE.position.y,this.DragBallTHREE.position.z);
    let direction = new THREE.Vector3();
    direction.subVectors(end, start);
    let totalLength = direction.length();
    direction.normalize();

    let tweentime = 1;
    //let lastItem = this.bodies.length-1;
    let speed = totalLength / tweentime;
    direction.multiplyScalar(speed);
    this.bodies[index].velocity.set(direction.x, direction.y, direction.z);
  }

  //Below is from scene 1
  createBox() {
    //Physics
    let body = new CANNON.Body({ mass: 10, material: this.groundMaterial });
    body.position.set(0, 1.5, 0);
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
    this.clearWorld.push(body);
    this.world.addBody(body);

    //graphics

    // cloneBox.overrideMaterial = this.boxMat;

    this.clearScene.push(this.cloneBox.uuid);
    this.scene.add(this.cloneBox);
    this.meshes.push(this.cloneBox);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    console.log("This is Clone");
  }

  createCoin = _event => {
    let shootPosition = new THREE.Vector3();
    let cloneMesh = this.coinObj.clone();

    let coinShape = new CANNON.Cylinder(0.15, 0.15, 0.03, 12);
    let coinBody = new CANNON.Body({
      mass: 0.1,
      material: this.physicMaterial
    });
    let quat = new CANNON.Quaternion(0.7071, 0, 0, 0.7071);
    quat.normalize();
    coinBody.addShape(coinShape, new CANNON.Vec3(), quat);

    this.world.add(coinBody);
    this.clearWorld.push(coinBody);
    this.bodies.push(coinBody);

    this.scene.add(cloneMesh);
    this.clearScene.push(cloneMesh.uuid);
    this.meshes.push(cloneMesh);

    let shootVelo = 7;
    shootPosition = this.throwPosition(_event);
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
        this.world.remove(coinBody);
        this.scene.remove(cloneMesh);
        cloneMesh.remove();
        this.meshes.splice(1, 1);
        this.bodies.splice(1, 1);
      }, 10000)
    );
  };

  throwPosition(e) {
    e = e || window.event;
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

  initBox() {
    //Graphics
    let boxMat = new THREE.MeshStandardMaterial({
      color: 0x190b02,
      roughness: 0.4,
      metalness: 0.4,
      emissive: 0x190b00
    });

    this.loader = new GLTFLoader(this.loadingManager);

    this.loader.load("assets/saisen4.glb", gltf => {
      this.boxObj = gltf.scene.children["0"];
      this.boxObj.receiveShadow = true;
      this.boxObj.castShadow = true;
      this.boxObj.children["0"].receiveShadow = true;
      this.boxObj.children["0"].castShadow = true;
      this.boxObj.children["0"].material.copy(boxMat);
    });
  }

  initCoin() {
    //Graphics
    let coinMat = new THREE.MeshStandardMaterial({
      color: 0xcec721,
      emissive: 0x595000,
      roughness: 0.41,
      metalness: 0.68
    });
    this.loaderCoin = new GLTFLoader(this.loadingManager);
    this.loaderCoin.load("assets/coinv3.glb", gltf => {
      this.coinObj = gltf.scene;
      this.coinObj.scale.set(0.12, 0.12, 0.12);
      this.coinObj.children["0"].material.copy(coinMat);
    });
  }
}

//DragControl function threejs
function DragControls(_objects, _camera, _domElement) {
  if (_objects instanceof THREE.Camera) {
    console.warn(
      "THREE.DragControls: Constructor now expects ( objects, camera, domElement )"
    );
    var temp = _objects;
    _objects = _camera;
    _camera = temp;
  }
  var _plane = new THREE.Plane();
  var _raycaster = new THREE.Raycaster();
  var _mouse = new THREE.Vector2();
  var _offset = new THREE.Vector3();
  var _intersection = new THREE.Vector3();
  var _selected = null,
    _hovered = null;
  //
  var scope = this;
  function activate() {
    _domElement.addEventListener("mousemove", onDocumentMouseMove, false);
    _domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    _domElement.addEventListener("mouseup", onDocumentMouseCancel, false);
    _domElement.addEventListener("mouseleave", onDocumentMouseCancel, false);
    _domElement.addEventListener("touchmove", onDocumentTouchMove, false);
    _domElement.addEventListener("touchstart", onDocumentTouchStart, false);
    _domElement.addEventListener("touchend", onDocumentTouchEnd, false);
  }
  function deactivate() {
    _domElement.removeEventListener("mousemove", onDocumentMouseMove, false);
    _domElement.removeEventListener("mousedown", onDocumentMouseDown, false);
    _domElement.removeEventListener("mouseup", onDocumentMouseCancel, false);
    _domElement.removeEventListener("mouseleave", onDocumentMouseCancel, false);
    _domElement.removeEventListener("touchmove", onDocumentTouchMove, false);
    _domElement.removeEventListener("touchstart", onDocumentTouchStart, false);
    _domElement.removeEventListener("touchend", onDocumentTouchEnd, false);
  }
  function dispose() {
    deactivate();
  }
  function onDocumentMouseMove(event) {
    event.preventDefault();
    var rect = _domElement.getBoundingClientRect();
    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouse, _camera);
    if (_selected && scope.enabled) {
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _selected.position.copy(_intersection.sub(_offset));
      }
      scope.dispatchEvent({
        type: "drag",
        object: _selected
      });
      return;
    }
    _raycaster.setFromCamera(_mouse, _camera);
    var intersects = _raycaster.intersectObjects(_objects);
    if (intersects.length > 0) {
      var object = intersects[0].object;
      _plane.setFromNormalAndCoplanarPoint(
        _camera.getWorldDirection(_plane.normal),
        object.position
      );
      if (_hovered !== object) {
        scope.dispatchEvent({
          type: "hoveron",
          object: object
        });
        _domElement.style.cursor = "pointer";
        _hovered = object;
      }
    } else {
      if (_hovered !== null) {
        scope.dispatchEvent({
          type: "hoveroff",
          object: _hovered
        });
        _domElement.style.cursor = "auto";
        _hovered = null;
      }
    }
  }
  function onDocumentMouseDown(event) {
    event.preventDefault();
    _raycaster.setFromCamera(_mouse, _camera);
    var intersects = _raycaster.intersectObjects(_objects);
    if (intersects.length > 0) {
      _selected = intersects[0].object;
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _offset.copy(_intersection).sub(_selected.position);
      }
      _domElement.style.cursor = "move";
      scope.dispatchEvent({
        type: "dragstart",
        object: _selected
      });
    }
  }
  function onDocumentMouseCancel(event) {
    event.preventDefault();
    if (_selected) {
      scope.dispatchEvent({
        type: "dragend",
        object: _selected
      });
      _selected = null;
    }
    _domElement.style.cursor = "auto";
  }
  function onDocumentTouchMove(event) {
    event.preventDefault();
    event = event.changedTouches[0];
    var rect = _domElement.getBoundingClientRect();
    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouse, _camera);
    if (_selected && scope.enabled) {
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _selected.position.copy(_intersection.sub(_offset));
      }
      scope.dispatchEvent({
        type: "drag",
        object: _selected
      });
      return;
    }
  }
  function onDocumentTouchStart(event) {
    event.preventDefault();
    event = event.changedTouches[0];
    var rect = _domElement.getBoundingClientRect();
    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouse, _camera);
    var intersects = _raycaster.intersectObjects(_objects);
    if (intersects.length > 0) {
      _selected = intersects[0].object;
      _plane.setFromNormalAndCoplanarPoint(
        _camera.getWorldDirection(_plane.normal),
        _selected.position
      );
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _offset.copy(_intersection).sub(_selected.position);
      }
      _domElement.style.cursor = "move";
      scope.dispatchEvent({
        type: "dragstart",
        object: _selected
      });
    }
  }
  function onDocumentTouchEnd(event) {
    event.preventDefault();
    if (_selected) {
      scope.dispatchEvent({
        type: "dragend",
        object: _selected
      });
      _selected = null;
    }
    _domElement.style.cursor = "auto";
  }
  activate();
  // API
  this.enabled = true;
  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;
  // Backward compatibility
  this.setObjects = function() {
    console.error("THREE.DragControls: setObjects() has been removed.");
  };
  this.on = function(type, listener) {
    console.warn(
      "THREE.DragControls: on() has been deprecated. Use addEventListener() instead."
    );
    scope.addEventListener(type, listener);
  };
  this.off = function(type, listener) {
    console.warn(
      "THREE.DragControls: off() has been deprecated. Use removeEventListener() instead."
    );
    scope.removeEventListener(type, listener);
  };
  this.notify = function(type) {
    console.error(
      "THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead."
    );
    scope.dispatchEvent({
      type: type
    });
  };
}
DragControls.prototype = Object.create(THREE.EventDispatcher.prototype);
DragControls.prototype.constructor = DragControls;
