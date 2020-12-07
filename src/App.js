import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";


class CVideo extends React.Component{
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.ctx = null;
    this.interVal = null;
    this.duration_cur = 0;
    this.state = {
      isShow: 'block' 
    }
    this.draw = ()=>{
      let w = this.canvasRef.current.offsetWidth;
      let h =  this.canvasRef.current.offsetHeight;
      let vw = this.videoRef.current.videoWidth;
      let vh = this.videoRef.current.videoHeight;
      this.canvasRef.current.getContext('2d').clearRect(0,0,w,h);
      this.canvasRef.current.getContext('2d').drawImage(this.videoRef.current,(w-vw)/2, (h-vh)/2,vw,vh);
    }
    this.onLoadedData = ()=>{
      if(!this.props.isposter) return;
      setTimeout(() => {
        this.draw();
        // this.videoRef.current.play();
      }, 100);
    }
    this.hide = ()=>{
      let w = this.canvasRef.current.offsetWidth;
      let h =  this.canvasRef.current.offsetHeight;
      this.canvasRef.current.getContext('2d').clearRect(0,0,w,h);
    }
    this.show = ()=>{
      this.draw();
    }

    this.onPlay = ()=>{
      this.interVal = setInterval(() => {
        this.draw();
        let timeDisplay = Math.floor(this.videoRef.current.currentTime);
        if(timeDisplay >= this.props.duration){
          this.videoRef.current.pause();
          this.onEnded();
        }
      }, 40);
    }
    this.onPause = ()=>{
      clearInterval(this.interVal);
    }
    this.onEnded = ()=>{
      clearInterval(this.interVal);
      this.props.onEnded();
    }
  }
  componentDidMount(){

  }
  render () {
    return (
        <div style={{width:'720px',height:'405px',position:'relative'}} id={this.props.id}>
          <canvas 
          width='720px' 
          height='405px'
          style={{position:'relative',zIndex:1}}
          ref={this.canvasRef}>
          </canvas>
          <video
          onLoadedData={this.onLoadedData} 
          onPlay={this.onPlay}
          onPause={this.onPause}
          onEnded={this.onEnded}
          webkit-playsinline="true"
          style={{visibility:'hidden',position:'absolute',left:"0",top:'0'}}
          ref={this.videoRef}>
          <source src={this.props.url} ></source>
          </video>
        </div>
    );
  }
}

function App() {
  const sceneData = [{
    index: 0,
    sentence: "This is a simple Javascript test",
    media: "https://media.gettyimages.com/videos/goodlooking-young-woman-in- casual-clothing-is-painting-in-workroom-video-id1069900546",
    duration: 3,

    text: '',
    // music: ''
  }, {
    index: 1,
    sentence: "Here comes the video!",
    media: "https://www.w3school.com.cn/example/html5/mov_bbb.mp4",
    duration: 5,

    text: '随便来点文字',
    // music: ''
  }];
  let info = {
    state: 0,
    progress: 0,
    maxProgress: 8,
    interVal: 0,
    scene: 0,
    refs: []
  };
  const stateRef = React.createRef();
  info.refs = sceneData.map((item,i)=>{
   return React.createRef();
  });
  const sceneMaskRef = React.createRef();
  const play = ()=>{
    if(info.state === 0){
      //初始播放
      change();
      info.state = 1;
      stateRef.current.innerHTML = '播放中';
    }else if(info.state === 1){
      //暂停
      info.state = 2;
      info.refs[info.scene].current.videoRef.current.pause();

      stateRef.current.innerHTML = '播放暂停';
    }else{
      //继续播放
      info.state = 1;
      info.refs[info.scene].current.videoRef.current.play();

      stateRef.current.innerHTML = '播放继续';
    }
  };
  
  const change = ()=>{
    let i = info.scene;
    if(i < info.refs.length){
      //暂停状态时停止操作
      if(info.state == 2){
        return;
      }
      //切换场景
      info.refs[i].current.videoRef.current.currentTime = 0;
      new Promise((resolve, reject)=>{
        if(i > 0){
          let w = info.refs[i].current.canvasRef.current.offsetWidth;
          let wr = 0;
          let h = info.refs[i].current.canvasRef.current.offsetHeight;
          let interVal = setInterval(() => {
            wr+=.1;
            if(wr <= 1){
              sceneMaskRef.current.getContext('2d').fillRect(0,0,wr*w,h);
            }else if(wr <= 2){
              info.refs[i-1].current.hide();
              info.refs[i].current.show();
              sceneMaskRef.current.getContext('2d').clearRect(0,0,(wr-1)*w,h);
            }else{
              sceneMaskRef.current.getContext('2d').clearRect(0,0,w,h);
              clearInterval(interVal);
              resolve();
            }
          }, 40);
        }else{ 
          info.refs[i].current.show();
          resolve();
        }
      }).then(()=>{
        //暂停状态时停止操作
        if(info.state == 2){
          return;
        }
        //开始播放下一个场景
        info.refs[i].current.videoRef.current.play();
        let data = sceneData[i];
        if(data.text){

        }
      });
      
    }else{
      //结束
      info.scene=0;
      info.state = 0;
      info.refs[0].current.videoRef.current.currentTime = 0;
      setTimeout(()=>{
        info.refs[i-1].current.hide();
        info.refs[0].current.show();
      },350);

      stateRef.current.innerHTML = '播放结束';
    }
  };
  const onEnded = ()=>{
    info.scene++;
    change();
  }
  return (
    <div className="App">
      <div style={{width:'720px',height:'405px'}} onClick={play}>
        {
          sceneData.map((item,i)=>{
            return <div style={{width:'720px',height:'405px',position:'absolute'}} key={i}>
            <CVideo url={item.media}  ref={info.refs[i]} isposter={!i} duration={item.duration} onEnded={onEnded}/>
          </div>
          })
        }
        <canvas 
          width='720px' 
          height='405px'
          style={{position:'relative',zIndex:1}}
          ref={sceneMaskRef}>
        </canvas>
      播放状态：<span ref={stateRef}>未播放</span>
      </div>
    </div>
  );
}

export default App;
