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
  private dragControl: DragControls;
  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private dt = 1 / 45;
  //object
  private rope: THREE.LineSegments;
  private pointBall: THREE.Mesh;
  private bodies: any[] = [];
  private meshes: any[] = [];
  private balls: any[] = [];
  private ballBodies: any[] = [];
  private mesh: THREE.Mesh;
  private physicMaterial: CANNON.Material;
  private groundMaterial: CANNON.Material;
  private isDrag= false;
  private isTooFar:boolean;
  private lastCur:THREE.Vector3;
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
    this.camera.position.set(8,2,10);
    this.scene.add(this.camera);

    
    

    //Create Light
    let light = new THREE.AmbientLight(0xf8bce5);
    //let light = new THREE.AmbientLight( 0xf5bae3,2);
    //light.position.set(0,7,5);
    this.scene.add(light);


    //mouse and raycaster
    this.mouse=new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.initCannon();
    //Create Floor
    //this.createGround();

    //Load model
    this.addSphereChain();

    //this.addRope();
    this.controls = new OrbitControls(this.camera,this.renderer.domElement);
    this.dragControl = new DragControls(this.balls, this.camera, this.renderer.domElement);
  }

  animate() {
    window.addEventListener('DOMContentLoaded', () => {
      this.render();
    })

    window.addEventListener('resize', () => {
      this.resize();
    })
    this.dragControl.addEventListener('dragstart', () =>{
      this.controls.enabled = false;
      this.isDrag=true;
      //this.bodies[this.bodies.length-1].position.copy(this.balls[0].position);
    });
    this.dragControl.addEventListener('drag', () =>{

    });
    this.dragControl.addEventListener('dragend', () =>{
      this.controls.enabled = true;
      this.isDrag=false;
      
    });
  }


  render() {
    requestAnimationFrame(() => {
      this.render();

    });
    this.world.step(this.dt);
    this.controls.update();
    // Update positions
    
    if(this.isDrag){
      this.bodies[11].position.copy(this.balls[0].position);
      //this.meshes[10].position.copy(this.balls[0].position);
      this.bodies[11].angularDamping = 1;
      this.bodies[11].linearDamping = 1;
  
    } else {
      this.balls[0].position.copy(this.meshes[11].position);
      this.balls[0].quaternion.copy(this.meshes[11].quaternion);
      this.bodies[11].angularDamping = 0.01;
      this.bodies[11].linearDamping = 0.01;
    }

    // if(!this.isTooFar){
    //   this.bodies[this.bodies.length-1].position= this.balls[0].position;
    // } else{
    //   this.bodies[this.bodies.length-1].position = this.lastCur;
    // }
    for (var i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position.copy(this.bodies[i].position);
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    }
    //this.tooFar(this.balls[0].position);
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
    material.color = new THREE.Color(0xBA4859);
    //material.transparent= true;

    this.mesh = new THREE.Mesh(floorGeo, material);
    this.scene.add(this.mesh);

    //Physics
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0, material: this.groundMaterial });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
  }

  addSphereChain() {
    let size = 0.05;
    let ropeLength = 10;
    let segment = 10;
    let segmentLength = 0.5*ropeLength / segment;
    let ropeShape = new CANNON.Cylinder(size, size, segmentLength, 10);
    let mass = 0;
    let lastBody = null;
    let quat = new CANNON.Quaternion(0.7071,0,0,0.7071);
    quat.normalize();
    for (let i = 0; i < segment; i++) {
      // Create a new body
      let ropeBody = new CANNON.Body({ mass: i === 0 ? mass : .5 });
      
      ropeBody.addShape(ropeShape,new CANNON.Vec3(),quat);
      //ropeBody.addShape(ropeShape);
      ropeBody.position.set(0, 1+(segment - i)*segmentLength, 0);
      this.bodies.push(ropeBody);
      ropeBody.angularDamping=0.99;
      ropeBody.linearDamping=0.99;
      this.world.addBody(ropeBody);
      //demo.addVisual(spherebody);

      let sphereGeo = new THREE.CylinderBufferGeometry(size, size, segmentLength, 10, 10);
      let material = new THREE.MeshBasicMaterial({ color: 0xababab });
      let sphereMesh = new THREE.Mesh(sphereGeo, material);
      this.meshes.push(sphereMesh);
      this.scene.add(sphereMesh);

     
      // Connect this body to the last one added
      // if(i!=0){
      //     // Connect the current body to the last one
      //     // We connect two corner points to each other.
      //     var c1 = new CANNON.PointToPointConstraint(ropeBody,new CANNON.Vec3(-size,size*3,0),lastBody,new CANNON.Vec3(-size,-size*3,0));
      //     var c2 = new CANNON.PointToPointConstraint(ropeBody,new CANNON.Vec3(size,size*3,0),lastBody,new CANNON.Vec3(size,-size*3,0));
      //     this.world.addConstraint(c1);
      //     this.world.addConstraint(c2);
      // } else {
      //     // First body is now static. The rest should be dynamic.
      //     mass=0.3;
      // }
      if (lastBody) {
        // Connect the current body to the last one
        let c = new CANNON.LockConstraint(ropeBody, lastBody);
        this.world.addConstraint(c);
      }
      // Keep track of the lastly added body
      lastBody = ropeBody;
    }

    let ballBody = new CANNON.Body({mass: 10});
    let ballShape = new CANNON.Sphere(0.5);
    let pos = lastBody.position.y-segmentLength;
    ballBody.addShape(ropeShape,new CANNON.Vec3(0,pos-0.5,0),quat);
    ballBody.addShape(ballShape,new CANNON.Vec3(0,pos-1,0));
    //ballBody.angularDamping=1;
    this.bodies.push(ballBody);
    this.world.addBody(ballBody);
    
    let ballGeo = new THREE.SphereGeometry(0.5, 20, 20);
    let ropee = new THREE.CylinderGeometry(size, size, segmentLength, 10, 10);
    ropee.translate(0,segmentLength,0);
    ballGeo.merge(ropee);
    //ballGeo.translate(0,.36,0);
    let ballMat = new THREE.MeshPhongMaterial({color:0xcccccc});
    let ballMesh = new THREE.Mesh(ballGeo,ballMat);
    this.meshes.push(ballMesh);
    this.scene.add(ballMesh);

    // let d = new CANNON.LockConstraint(lastBody, ballBody);
    // this.world.addConstraint(d);
    var d = new CANNON.DistanceConstraint(lastBody,ballBody,1);
    var c = new CANNON.PointToPointConstraint(lastBody,new CANNON.Vec3(0,-0.38-segmentLength/4,0), ballBody,new CANNON.Vec3(0,0.38+segmentLength/4,0));
    this.world.addConstraint(c);
    //this.world.addConstraint(d);

    //fake
    let fake1 = new CANNON.Body({mass:.1});
    fake1.addShape(new CANNON.Sphere(0.5));
    //fake1.linearDamping=.99;
    this.bodies.push(fake1);
    this.world.addBody(fake1);

    let fake1Mat = new THREE.MeshBasicMaterial({color:0xff00ff});
    fake1Mat.opacity=0;
    fake1Mat.transparent = true;
    let fake1Geo = new THREE.SphereGeometry(0.5,20,20);
    let fake1Mesh = new THREE.Mesh(fake1Geo,fake1Mat);
    this.meshes.push(fake1Mesh);
    this.scene.add(fake1Mesh);
    let e = new CANNON.LockConstraint(ballBody,fake1);
    this.world.addConstraint(e);
    console.log(fake1Mesh);
    console.log(ballBody);
    //pull
    
    let cloneMat = new THREE.MeshBasicMaterial({opacity:0,transparent:true});
    let ballClone = new THREE.Mesh(ballGeo,cloneMat);

    this.balls.push(ballClone);
    this.scene.add(ballClone);

  }

  tooFar(cursorPos:THREE.Vector3){
    let distance = cursorPos.distanceTo(this.bodies[0].position);
    let lastItem = this.meshes.length-1;
    console.log(distance,this.bodies[lastItem].position);
    setTimeout(() => {
      if (distance>6.1){
        this.bodies[lastItem].position.copy(this.lastCur);
        this.meshes[lastItem].position.copy(this.lastCur);
          //this.bodies[lastItem].quaternion.copy(this.lastCur);
      } else {
        this.bodies[lastItem].position.copy(cursorPos);
        this.meshes[lastItem].position.copy(cursorPos);
        this.lastCur = cursorPos;
          //this.bodies[lastItem].quaternion.copy(cursorPos);
      }
    }, 100);
    
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