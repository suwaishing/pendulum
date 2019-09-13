import * as THREE from "three";
import * as CANNON from "cannon";
import * as OrbitControls from 'three-orbitcontrols';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PendulumService {
  private world: CANNON.World;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  
  private controls: OrbitControls;
  private dragControl;
  private dt = 1 / 60;
  private loop=true;
  //object
  private bodies: any[] = [];
  private meshes: any[] = [];
  private balls: any[] = [];
  private lastBallsMesh: any[] = [];
  private physicMaterial: CANNON.Material;
  private isDrag = false;
  constructor() { }

  createScene(id: string) {
    this.loop=true;
    this.canvas = <HTMLCanvasElement>document.getElementById(id);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    //Create scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000);
    this.camera.position.set(0, 6, 12);
    this.scene.add(this.camera);




    //Create Light
    let light = new THREE.PointLight(0xf9690e, 1);
    light.position.set(0, 10, 0);
    this.scene.add(light);

    let light2 = new THREE.HemisphereLight(0xf9690e, 0xff6347, 0.7);
    light2.position.set(0, 10, 0);
    this.scene.add(light2);

    let light3 = new THREE.PointLight(0xff6347,1);
    light3.position.set(0, -10, 0);
    this.scene.add(light3);

 

    this.initCannon();
    //Create Floor
    this.createGround();

    //Load model
    let penNum = 5;
    let start = -2;
    for (let i = 0; i < penNum; i++) {
      this.addSphereChain(start+i);
    }
    //this.addRope();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.5;
    this.dragControl = new DragControls(this.balls, this.camera, this.renderer.domElement);
  }

  animate() {
    this.render();
    // this.runResize=()=>{this.resize();}
    // window.addEventListener('resize',this.runResize);

    this.dragControl.addEventListener('dragstart', () => {
      this.controls.enabled = false;
      //this.dragDirection();
      this.isDrag = true;
    });

    this.dragControl.addEventListener('dragend', () => {
      this.controls.enabled = true;
      //this.removeDragDirection();
      this.isDrag = false;
    });
  }

  deleteEverything(){
    // window.removeEventListener('resize',this.runResize);
      this.scene=null;
      this.world=null;
      this.camera=null;
      this.renderer=null;
      this.controls = null;
      this.dragControl = null;
      this.loop=false;
      this.bodies.length=0;
      this.meshes.length=0;
      this.balls.length=0;
      this.lastBallsMesh.length=0;
  

  }

  resizeRendererToDisplaySize(renderer:THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
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
      //this.controls.update();
      this.resize();
      
      this.world.step(this.dt);
      for (let i = 0; i < this.lastBallsMesh.length; i++) {
        const lastBall = this.lastBallsMesh[i];
        let start = this.meshes[lastBall].position;
        let end = this.balls[i].position;
        let distance = start.distanceTo(end).toFixed(1);
        parseFloat(distance);
        if (this.isDrag && distance > 0.1) {
          this.testing(start, end, lastBall);
        } else {
          this.balls[i].position.copy(this.bodies[lastBall].position);
  
        }
      }
  
      for (let i = 0; i < this.meshes.length; i++) {
        this.meshes[i].position.copy(this.bodies[i].position);
        this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
      }
      this.renderer.render(this.scene, this.camera);  
    }
  }

  resize() {
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    // this.camera.updateProjectionMatrix();
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
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

    let ball_ball = new CANNON.ContactMaterial(this.physicMaterial, this.physicMaterial, { friction: 0.9, restitution: 0.9 });
    this.world.addContactMaterial(ball_ball);
  }

  createGround() {
    //let background = new THREE.IcosahedronGeometry(20);
    let background = new THREE.BoxGeometry(20, 20, 20);
    let backgroundMat = new THREE.MeshStandardMaterial({ color: 0xc09bef, roughness: 1, emissive: 0x000000, side: THREE.BackSide });
    let backgroundMesh = new THREE.Mesh(background, backgroundMat);
    // backgroundMesh.receiveShadow = true;
    backgroundMesh.position.set(0, 0, 0);
    backgroundMesh.rotation.set(0, -Math.PI / 2, 0);
    backgroundMesh.position.normalize();
    this.scene.add(backgroundMesh);
  }

  addSphereChain(x: number) {
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
    this.world.addBody(holdPoint);

    let sphereGeo = new THREE.SphereBufferGeometry(size, 8, 8);
    let material = new THREE.MeshStandardMaterial({color:0x3d59fb});
    let sphereMesh = new THREE.Mesh(sphereGeo, material);
    this.meshes.push(sphereMesh);
    this.scene.add(sphereMesh);

    // Rope
    let ropeShape = new CANNON.Cylinder(size, size, 4, 8);
    let ropeBody = new CANNON.Body({ mass: .1 });
    ropeBody.addShape(ropeShape, new CANNON.Vec3(), quat);
    ropeBody.position.set(x, 2, 0);
    this.bodies.push(ropeBody);
    // ropeBody.angularDamping=.5;
    // ropeBody.linearDamping=.5;
    this.world.addBody(ropeBody);

    let ropeGeo = new THREE.CylinderGeometry(size, size, 4, 8, 8);
    let material02 = new THREE.MeshStandardMaterial({color:0x3d59fb});
    let sphereMesh02 = new THREE.Mesh(ropeGeo, material02);
    this.meshes.push(sphereMesh02);
    this.scene.add(sphereMesh02);

    let c = new CANNON.PointToPointConstraint(holdPoint, new CANNON.Vec3(0, 0, 0), ropeBody, new CANNON.Vec3(0, 2, 0));
    this.world.addConstraint(c);

    // Balls
    let lastBallCannon = new CANNON.Body({ mass: .1, material: this.physicMaterial });
    let ballShape = new CANNON.Sphere(radius);
    lastBallCannon.addShape(ballShape);

    lastBallCannon.position.set(x, 0 - radius, 0);
    this.bodies.push(lastBallCannon);
    this.world.addBody(lastBallCannon);

    let ballGeo = new THREE.SphereGeometry(radius, 20, 20);
    let ballMat = new THREE.MeshStandardMaterial({ color: 0x8092f7, roughness:0.5, metalness:0.6 });
    let ballMesh = new THREE.Mesh(ballGeo, ballMat);
    // ballMesh.castShadow = true;
    // ballMesh.receiveShadow = true;
    this.meshes.push(ballMesh);
    this.scene.add(ballMesh);

    this.lastBallsMesh.push(this.meshes.indexOf(ballMesh));

    let d = new CANNON.LockConstraint(ropeBody, lastBallCannon);
    this.world.addConstraint(d);

    // pull
    let cloneMat = new THREE.MeshBasicMaterial({ opacity: 0, transparent: true });
    let DragBallTHREE = new THREE.Mesh(ballGeo, cloneMat);

    this.balls.push(DragBallTHREE);
    this.scene.add(DragBallTHREE);
  }

  testing(start: THREE.Vector3, end: THREE.Vector3, index: number) {
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

}

//DragControl function threejs
function DragControls(_objects, _camera, _domElement) {

  if (_objects instanceof THREE.Camera) {
    console.warn('THREE.DragControls: Constructor now expects ( objects, camera, domElement )');
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
    _domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    _domElement.addEventListener('mouseup', onDocumentMouseCancel, false);
    _domElement.addEventListener('mouseleave', onDocumentMouseCancel, false);
    _domElement.addEventListener('touchmove', onDocumentTouchMove, false);
    _domElement.addEventListener('touchstart', onDocumentTouchStart, false);
    _domElement.addEventListener('touchend', onDocumentTouchEnd, false);
  }
  function deactivate() {
    _domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
    _domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
    _domElement.removeEventListener('mouseup', onDocumentMouseCancel, false);
    _domElement.removeEventListener('mouseleave', onDocumentMouseCancel, false);
    _domElement.removeEventListener('touchmove', onDocumentTouchMove, false);
    _domElement.removeEventListener('touchstart', onDocumentTouchStart, false);
    _domElement.removeEventListener('touchend', onDocumentTouchEnd, false);
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
        type: 'drag',
        object: _selected
      });
      return;
    }
    _raycaster.setFromCamera(_mouse, _camera);
    var intersects = _raycaster.intersectObjects(_objects);
    if (intersects.length > 0) {
      var object = intersects[0].object;
      _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), object.position);
      if (_hovered !== object) {
        scope.dispatchEvent({
          type: 'hoveron',
          object: object
        });
        _domElement.style.cursor = 'pointer';
        _hovered = object;
      }
    } else {
      if (_hovered !== null) {
        scope.dispatchEvent({
          type: 'hoveroff',
          object: _hovered
        });
        _domElement.style.cursor = 'auto';
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
      _domElement.style.cursor = 'move';
      scope.dispatchEvent({
        type: 'dragstart',
        object: _selected
      });
    }

  }
  function onDocumentMouseCancel(event) {
    event.preventDefault();
    if (_selected) {
      scope.dispatchEvent({
        type: 'dragend',
        object: _selected
      });
      _selected = null;
    }
    _domElement.style.cursor = 'auto';
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
        type: 'drag',
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
      _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _selected.position);
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _offset.copy(_intersection).sub(_selected.position);
      }
      _domElement.style.cursor = 'move';
      scope.dispatchEvent({
        type: 'dragstart',
        object: _selected
      });
    }

  }
  function onDocumentTouchEnd(event) {
    event.preventDefault();
    if (_selected) {
      scope.dispatchEvent({
        type: 'dragend',
        object: _selected
      });
      _selected = null;
    }
    _domElement.style.cursor = 'auto';
  }
  activate();
  // API
  this.enabled = true;
  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;
  // Backward compatibility
  this.setObjects = function () {
    console.error('THREE.DragControls: setObjects() has been removed.');
  };
  this.on = function (type, listener) {
    console.warn('THREE.DragControls: on() has been deprecated. Use addEventListener() instead.');
    scope.addEventListener(type, listener);
  };
  this.off = function (type, listener) {
    console.warn('THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.');
    scope.removeEventListener(type, listener);
  };
  this.notify = function (type) {
    console.error('THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.');
    scope.dispatchEvent({
      type: type
    });
  };
}
DragControls.prototype = Object.create(THREE.EventDispatcher.prototype);
DragControls.prototype.constructor = DragControls;