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
  private lastBallCannon;
  private DragBallTHREE;
  private interval01;
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
    let light = new THREE.AmbientLight(0xfafafa,0.1);
    //let light = new THREE.AmbientLight( 0xf5bae3,2);
    //light.position.set(0,10,0);
    //this.scene.add(light);

    let light2 = new THREE.HemisphereLight(0xafcce4,0x883ee8,0.5);
    light2.position.set(0,20,0);
    this.scene.add(light2);

    let light3 = new THREE.PointLight(0xd8fae9,3,15,2);
    light3.position.set(0,5,0);
    light3.castShadow=true;
    this.scene.add(light3);

    let light4 = new THREE.PointLight(0x8e50a9,3,15,2);
    light4.position.set(0,-5,0);
    light4.castShadow=true;
    this.scene.add(light4);

    //mouse and raycaster
    this.mouse=new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.initCannon();
    //Create Floor
    this.createGround();

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

    window.addEventListener('mousedown', (e) => {
      e.preventDefault();

 
    })

    window.addEventListener('mouseup', (e) => {
      
    })

    window.addEventListener('resize', () => {
      this.resize();
    })
    this.dragControl.addEventListener('dragstart', () =>{
      this.controls.enabled = false;
      this.isDrag=true;
      this.interval01=setInterval(()=>{
        this.testing();
      },15);
      //this.bodies[this.bodies.length-1].position.copy(this.balls[0].position);
    });
    this.dragControl.addEventListener('dragend', () =>{
      this.controls.enabled = true;
      this.isDrag=false;
      this.endtesting();
      clearInterval(this.interval01);
    });
  }


  render() {
    requestAnimationFrame(() => {
      this.render();

    });
    this.world.step(this.dt);
    this.controls.update();
    // Update positions
    // let lastItem = this.bodies.length-1;
    // if(this.isDrag){
    //   this.bodies[lastItem].position.copy(this.balls[0].position);
      //this.meshes[10].position.copy(this.balls[0].position);
      // this.bodies[lastItem].angularDamping = .99;
      // this.bodies[lastItem].linearDamping = .99;
      // this.bodies[lastItem-1].angularDamping = .99;
      // this.bodies[lastItem-1].linearDamping = .5;
    // } else {
    //   this.balls[0].position.copy(this.meshes[lastItem].position);
    //   this.balls[0].quaternion.copy(this.meshes[lastItem].quaternion);
    //   // this.bodies[lastItem].angularDamping = .01;
    //   // this.bodies[lastItem].linearDamping = .01;
    //   // this.bodies[lastItem-1].angularDamping = .05;
    //   // this.bodies[lastItem-1].linearDamping = .05;
    // }
    if(this.isDrag){

    }else{
      this.DragBallTHREE.position.copy(this.lastBallCannon.position);
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
    //let background = new THREE.IcosahedronGeometry(20);
    let background = new THREE.BoxGeometry(20,20,20);
    let backgroundMat = new THREE.MeshStandardMaterial({color: 0xfffcf8, roughness:1, emissive:0x000000, side: THREE.BackSide});
    let backgroundMesh = new THREE.Mesh(background,backgroundMat);
    backgroundMesh.receiveShadow= true;
    backgroundMesh.position.set(0,0,0);
    backgroundMesh.rotation.set(0,-Math.PI/2,0);
    backgroundMesh.position.normalize();

    this.scene.add(backgroundMesh);

    //Graphics
    // let floorGeo = new THREE.PlaneGeometry(100, 100, 25, 25);
    // floorGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    
    // let material = new THREE.MeshStandardMaterial();
    // material.color = new THREE.Color(0xBA4859);
    // //material.transparent= true;

    // this.mesh = new THREE.Mesh(floorGeo, material);
    // this.mesh.position.set(0,-3,0);
    // this.scene.add(this.mesh);

    // //Physics
    // let groundShape = new CANNON.Plane();
    // let groundBody = new CANNON.Body({ mass: 0, material: this.groundMaterial });
    // groundBody.addShape(groundShape);
    // groundBody.position.set(0,-3,0);
    // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    // this.world.addBody(groundBody);
  }

  addSphereChain() {
    let size = 0.02;
    let ropeLength = 12;
    let segment = 24;
    let radius = 0.5;
    // let segmentLength = 0.5*ropeLength / segment;
    let segmentLength = 0.1;
    let ropeShape = new CANNON.Cylinder(size, size, segmentLength, 10);
    let mass = 0;
    let lastBody = null;
    let quat = new CANNON.Quaternion(0.5,0,0,0.5);
    quat.normalize();
    // for (let i = 0; i < segment; i++) {
    //   // Create a new body
    //   let ropeBody = new CANNON.Body({ mass: i === 0 ? mass : 1 });
     
    //   ropeBody.addShape(ropeShape,new CANNON.Vec3(),quat);
    //   //ropeBody.addShape(ropeShape);
    //   ropeBody.position.set(0,(segment - i)*segmentLength, 0);
    //   this.bodies.push(ropeBody);
    //   ropeBody.angularDamping=.5;
    //   ropeBody.linearDamping=.5;
    //   this.world.addBody(ropeBody);
    //   //demo.addVisual(spherebody);

    //   let sphereGeo = new THREE.CylinderGeometry(size, size, segmentLength*1, 10, 10);
    //   let material = new THREE.MeshBasicMaterial({ color: 0xababab });
    //   let sphereMesh = new THREE.Mesh(sphereGeo, material);
    //   this.meshes.push(sphereMesh);
    //   this.scene.add(sphereMesh);

     
    //   // Connect this body to the last one added
    //   // if(i!=0){
    //   //     // Connect the current body to the last one
    //   //     // We connect two corner points to each other.
    //   //     var c1 = new CANNON.PointToPointConstraint(ropeBody,new CANNON.Vec3(-size,size*3,0),lastBody,new CANNON.Vec3(-size,-size*3,0));
    //   //     var c2 = new CANNON.PointToPointConstraint(ropeBody,new CANNON.Vec3(size,size*3,0),lastBody,new CANNON.Vec3(size,-size*3,0));
    //   //     this.world.addConstraint(c1);
    //   //     this.world.addConstraint(c2);
    //   // } else {
    //   //     // First body is now static. The rest should be dynamic.
    //   //     mass=0.3;
    //   // }
    //   if (lastBody) {
    //     // Connect the current body to the last one
    //     let c = new CANNON.LockConstraint(ropeBody, lastBody);
    //     this.world.addConstraint(c);
    //     // let d = new CANNON.DistanceConstraint(ropeBody, lastBody);
    //     //d.collideConnected=false;
    //     // this.world.addConstraint(d);
    //   }
    //   // Keep track of the lastly added body
    //   lastBody = ropeBody;
    // }



    let notgaysize = 0.05;
    // NOT GAY
    let NGropeshape = new CANNON.Sphere(0.1);
    let ropeBody = new CANNON.Body({ mass : 0 });
    ropeBody.addShape(NGropeshape,new CANNON.Vec3(),quat);
    ropeBody.position.set(0,4,0);
    this.bodies.push(ropeBody);
    // ropeBody.angularDamping=.5;
    // ropeBody.linearDamping=.5;
    this.world.addBody(ropeBody);

    let sphereGeo = new THREE.SphereBufferGeometry(notgaysize, 8, 8);
    let material = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
    let sphereMesh = new THREE.Mesh(sphereGeo, material);
    this.meshes.push(sphereMesh);
    this.scene.add(sphereMesh);

    // NOT GAY 02
    let NGropeshape02 = new CANNON.Cylinder(notgaysize, notgaysize, 4, 8);
    let ropeBody02 = new CANNON.Body({ mass : .1 });
    ropeBody02.addShape(NGropeshape02,new CANNON.Vec3(),quat);
    ropeBody02.position.set(0,2,0);
    this.bodies.push(ropeBody02);
    ropeBody02.angularDamping=.5;
    ropeBody02.linearDamping=.5;
    this.world.addBody(ropeBody02);

    let sphereGeo02 = new THREE.CylinderGeometry(notgaysize, notgaysize, 4, 8, 8);
    let material02 = new THREE.MeshBasicMaterial({ color: 0xababab });
    let sphereMesh02 = new THREE.Mesh(sphereGeo02, material02);
    this.meshes.push(sphereMesh02);
    this.scene.add(sphereMesh02);


    let c = new CANNON.PointToPointConstraint(ropeBody,new CANNON.Vec3(0,0,0),ropeBody02,new CANNON.Vec3(0,2,0));
    this.world.addConstraint(c);
    // let c = new CANNON.LockConstraint(ropeBody, ropeBody02);
    // this.world.addConstraint(c);



    this.lastBallCannon = new CANNON.Body({mass: .1});
    let ballShape = new CANNON.Sphere(radius);
    // let pos = lastBody.position.y-segmentLength;
    // let jointShape = new CANNON.Cylinder(size, size, segmentLength, 10);
    // ballBody.addShape(jointShape,new CANNON.Vec3(0,radius+segmentLength/2,0),quat);
    this.lastBallCannon.addShape(ballShape);
    // this.lastBallCannon.angularDamping=.5;
    // this.lastBallCannon.linearDamping=.5;

    this.lastBallCannon.position.set(0,0-radius,0)
    this.bodies.push(this.lastBallCannon);
    this.world.addBody(this.lastBallCannon);
    
    let ballGeo = new THREE.SphereGeometry(radius, 20, 20);
    let ropee = new THREE.CylinderGeometry(size, size, segmentLength, 10, 10);
    // ropee.translate(0,radius+segmentLength/2,0);
    // ballGeo.merge(ropee);
    //ballGeo.translate(0,.36,0);
    let ballMat = new THREE.MeshPhongMaterial({color:0xcccccc});
    let ballMesh = new THREE.Mesh(ballGeo,ballMat);
    ballMesh.castShadow=true;
    ballMesh.receiveShadow = true;
    this.meshes.push(ballMesh);
    this.scene.add(ballMesh);

    let d = new CANNON.LockConstraint(ropeBody02, this.lastBallCannon);
    //d.collideConnected = false;
    this.world.addConstraint(d);
    
    // var d = new CANNON.DistanceConstraint(lastBody,ballBody,.9);
    // var c = new CANNON.PointToPointConstraint(lastBody,new CANNON.Vec3(0,-0.4-segmentLength/4,0), ballBody,new CANNON.Vec3(0,0.4+segmentLength/4,0));
    // this.world.addConstraint(c);
    // this.world.addConstraint(d);

    // fake
    // let fake1 = new CANNON.Body({mass:1});
    // fake1.addShape(new CANNON.Box(new CANNON.Vec3(0.1,0.1,0.1)));
    // // fake1.linearDamping=1;
    // // fake1.angularDamping=1;
    // fake1.position.set(0,ballBody.position.y,0);
    // this.bodies.push(fake1);
    // this.world.addBody(fake1);

    // let fake1Mat = new THREE.MeshBasicMaterial({color:0xff00ff});
    // fake1Mat.opacity=1;
    // fake1Mat.transparent = true;
    // let fake1Geo = new THREE.SphereGeometry(radius,20,20);
    // let fake1Mesh = new THREE.Mesh(fake1Geo,fake1Mat);
    // this.meshes.push(fake1Mesh);
    // this.scene.add(fake1Mesh);
    // let e = new CANNON.LockConstraint(ballBody,fake1);
    // this.world.addConstraint(e);

    // // pull
    ballGeo = new THREE.SphereGeometry(radius*.5, 20, 20);
    let cloneMat = new THREE.MeshBasicMaterial({opacity:1,transparent:true});
    //let cloneMat = new THREE.MeshBasicMaterial({color:0x00ff00});
    this.DragBallTHREE = new THREE.Mesh(ballGeo,cloneMat);

    this.balls.push(this.DragBallTHREE);
    this.scene.add(this.DragBallTHREE);

  }

  testing(){
    this.world.gravity.set(this.DragBallTHREE.position.x,this.DragBallTHREE.position.y,this.DragBallTHREE.position.z);
  }

  endtesting(){
    this.world.gravity.set(0,-10,0);
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