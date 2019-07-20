import * as THREE from "three";
import * as CANNON from "cannon";
import GLTFLoader from 'three-gltf-loader';
import {OrbitControls} from 'three-orbitcontrols-ts';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PendulumService {

  constructor() { }
  private world: CANNON.World;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private dragControl: DragControls;
  private control: OrbitControls;
  private dt = 1 / 60;

  //sync
  private bodies: any[] = [];
  private meshes: any[] = [];

  createScene(id: string){
    this.canvas = <HTMLCanvasElement>document.getElementById(id);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //Create scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000);
    this.scene.add(this.camera);
    this.light = new THREE.AmbientLight( 0xf5bae3,1);
    this.scene.add(this.light);

    //this.control = new OrbitControls(this.camera, this.canvas);

    this.initCannon();
    //Create Floor
    this.createGround();

    //Load model
    this.createChain();
  }

  animate(){
    window.addEventListener('DOMContentLoaded', () => {
      this.render();
    })

    window.addEventListener('resize', () => {
      this.resize();
    })
  }

  render() {
    requestAnimationFrame(() => {
      this.render();

    });
    this.world.step(this.dt);
    //this.control.update();
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
    //this.groundMaterial = new CANNON.Material();

    //ball material
    //this.physicMaterial = new CANNON.Material();

    //var ball_ground = new CANNON.ContactMaterial(this.groundMaterial, this.physicMaterial, { friction: 0.3, restitution: 0.3 });
    //this.world.addContactMaterial(ball_ground);
  }

  createGround() {
    //Graphics
    let floorGeo = new THREE.PlaneGeometry(100, 100, 25, 25);
    floorGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    let material = new THREE.MeshStandardMaterial();
    material.color= new THREE.Color(0xBA4859);
    //material.transparent= true;

    let mesh = new THREE.Mesh(floorGeo, material);
    this.meshes.push(mesh);
    this.scene.add(mesh);

    //Physics
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
    this.bodies.push(groundBody);
  }

  createChain(){
    let size: .1;
    let cylinderShape = new CANNON.Cylinder(size,size,size*2,8);
    var quat = new CANNON.Quaternion(0.5,0,0,0.5);
    quat.normalize();
    let mass = 0;
    let last = null;
    let N = 10;
    for (let i = 0; i < N; i++) {
      const cylinderBody = new CANNON.Body({mass: i===0? mass:.5});
      cylinderBody.addShape(cylinderShape,new CANNON.Vec3,quat);
      cylinderBody.position.set(0,2-(i*size*2),0);
      this.bodies.push(cylinderBody);
      this.world.addBody(cylinderBody);

      let cylinderGeo = new THREE.CylinderBufferGeometry(size,size,size*2,8);
      let material = new THREE.MeshBasicMaterial({color:0x00ff00});
      let cylinderMesh = new THREE.Mesh(cylinderGeo, material);
      this.meshes.push(cylinderMesh);
      this.scene.add(cylinderMesh);

      // if(last){
      //   const c = new CANNON.LockConstraint(cylinderMesh,last);
      //   this.world.addContraint(c);
      // }
      // last = cylinderBody;
      
    }

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
   this.setObjects = function() {
     console.error('THREE.DragControls: setObjects() has been removed.');
   };
   this.on = function(type, listener) {
     console.warn('THREE.DragControls: on() has been deprecated. Use addEventListener() instead.');
    scope.addEventListener(type, listener);
   };
   this.off = function(type, listener) {
     console.warn('THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.');
    scope.removeEventListener(type, listener);
   };
   this.notify = function(type) {
     console.error('THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.');
    scope.dispatchEvent({
      type: type
    });
   };
 }
 DragControls.prototype = Object.create(THREE.EventDispatcher.prototype);
DragControls.prototype.constructor = DragControls;


