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

  createScene(id: string){

  }
  animate(){

  }
}
