import * as THREE from "three";
import { Injectable } from '@angular/core';
import { VirtualTimeScheduler } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoinService {
  private canvas:HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;

  //object
  private cube: THREE.Mesh;
  
  constructor() { }

  createScene(id: string) {
    this.canvas =<HTMLCanvasElement>document.getElementById(id);

    this.renderer= new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth,window.innerHeight);

    //Create scene
    this.scene=new THREE.Scene();

    this.camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,.1,1000);
    this.camera.position.z=5;
    this.scene.add(this.camera);

    //Create Light
    this.light=new THREE.AmbientLight(0x404040);
    this.light.position.z=10;
    this.scene.add(this.light);

    //Create Object
    let geometry=new THREE.BoxGeometry(1,1,1);
    let material= new THREE.MeshPhongMaterial({color:0x00ff00});
    this.cube=new THREE.Mesh(geometry,material);
    this.scene.add(this.cube);
    
  }

  animate(){
    window.addEventListener('DOMContentLoaded',()=>{
      this.render();
    })

    window.addEventListener('resize',()=>{
      this.resize();
    })
  }

  render(){
    requestAnimationFrame(()=>{
      this.render();
    });
    this.cube.rotation.x+=.01;
    this.cube.rotation.y+=.01;
    this.renderer.render(this.scene,this.camera);
  }

  resize(){
    let width=window.innerWidth;
    let height=window.innerHeight;
    this.camera.aspect=width/height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width,height);
  }
}
