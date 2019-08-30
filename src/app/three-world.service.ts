import { Injectable } from '@angular/core';
import * as THREE from "three";
import * as CANNON from "cannon";

@Injectable({
  providedIn: 'root'
})
export class ThreeWorldService {
  private world: CANNON.World;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;
  public dt;
  public bodies: any[] = [];
  public meshes: any[] = [];

  constructor() { }
  createScene(id:string){
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
  }

  initCannon() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);
    //this.world.broadphase=new CANNON.NaiveBroadphase();
  }

  
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setCameraPosition(x:number,y:number,z:number){
    this.camera.position.set(x, y, z);
  }
}
