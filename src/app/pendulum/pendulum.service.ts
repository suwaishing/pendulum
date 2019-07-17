import * as THREE from "three";
import * as CANNON from "cannon";
import GLTFLoader from 'three-gltf-loader';
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
  private dt = 1 / 60;

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

    this.initCannon();
    //Create Floor
    this.createGround();

    //Load model
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

    // Update positions

    // for (var i = 0; i < this.meshes.length; i++) {
    //   this.meshes[i].position.copy(this.bodies[i].position);
    //   this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    // }

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
    this.scene.add(mesh);

    //Physics
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.world.addBody(groundBody);
  }
}
