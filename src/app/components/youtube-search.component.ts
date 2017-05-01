import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { YoutubeGetVideo } from '../config/youtube.config';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';

@Component({
  selector: 'yt-search',
  templateUrl: 'youtube-search.component.html',
})

export class SearchComponent {

  searchForm: FormGroup;

  videos: any;
  player: YT.Player;
  currentVideoID: string = 'Not Exist';
  currentVideoName: string;
  currentState: number;

  ref: any;
  videoRangeTimer: any;
  videoCurRange: number = 0;
  videoMaxRange: number = 0;

  videoCurFull: string = '00:00:00';
  videoMaxFull: string = '00:00:00';

  videoCurVolume: number = 0;
  
  constructor(private youtube: YoutubeGetVideo, ref: ChangeDetectorRef) {
    this.ref = ref;
  }
 
  ngOnInit() {
    this.searchForm = new FormGroup({
      searchInput: new FormControl('', [Validators.required, Validators.minLength(2)])
    });
    
    this.searchForm.valueChanges.subscribe((form) => {
        this.youtube.searchVideo(form.searchInput).subscribe(
          result => {
            if(!this.searchForm.invalid) {
              this.videos = result.items;    
            } else {
              this.videos = null;
            }
          },
          error => {
            console.log('error');
          }
        );
    })
    
  }

  clearSearch() {
    this.searchForm.reset();
    this.videos = null;
  }

  onSubmit(event: Event) {
    event.preventDefault();
  }

  onClickVideo(event: Event, i: any) {
    let clickedVideo = this.videos[i];
    this.currentVideoID = clickedVideo.id.videoId;
    this.currentVideoName = clickedVideo.snippet.title;
    this.player.loadVideoById(this.currentVideoID);
    console.log(clickedVideo);
  }

  savePlayer (player) {
    this.player = player;
    console.log(this.player);
  }
  
  onStateChange(event){
    this.currentState = event.data;
    this.videoMaxRange = this.player.getDuration();
    if(this.currentState === 1) {
      this.videoMaxFull = this.timeFormat(this.videoMaxRange);
      this.videoCurVolume = this.player.getVolume();
      this.startRange();
    }
    if(this.currentState === 0) {
      this.stopRange();
    }
  }

  playPauseVideo() {
    if(this.currentState === 0) {
      this.player.playVideo();
    }
    if(this.currentState === 1) {
      this.player.pauseVideo();
    }
    if(this.currentState === 2) {
      this.player.playVideo();
    }
  }

  startRange() {
    this.stopRange();
    this.videoRangeTimer = setInterval(() => {  
      this.videoCurRange = this.player.getCurrentTime();
      this.videoCurFull = this.timeFormat(this.videoCurRange);
      this.ref.markForCheck();
    }, 1000);
  }

  stopRange() {
     clearTimeout(this.videoRangeTimer);
  }

  RangeNouseDown(event: Event) {
    if(event['buttons'] === 1) {
      this.stopRange();
    }
  }

  RangeMouseUp(value: number) {
    this.player.seekTo(value, true);
    this.videoCurRange = value;
    this.startRange();
  }

  volumeRangeMouseUp(value: number) {
    console.log(value);
  }

  timeFormat(time: number) {
    let hours: any = Math.floor(time / 3600);
    let minutes: any = Math.floor(time % 3600 / 60);
    let seconds: any = Math.floor(time % 3600 % 60);
    let value = (parseInt(hours) < 10 ? '0' : '' ) + parseInt(hours) + ':' + (parseInt(minutes) < 10 ? '0' : '' ) + parseInt(minutes) + ':' + (parseInt(seconds) < 10 ? '0' : '' ) + parseInt(seconds);
    return value;
  }
  
}