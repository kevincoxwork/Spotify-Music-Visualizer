import React from "react";
import io from 'socket.io-client';


const request = require('request');
const queue = require('queue');
const urls = require("./urls");

class activeUser {
    constructor(access_token, socket, name, room, device){
        this.access_token = access_token;
        this.socket = socket
        this.name = name;
        this.room = room
        this.connectedDevice = device;
    }
}

class songTrack {
    constructor(id, name, uri){
        this.id = id;
        this.name =  name;
        this.uri = uri;
    }
}


export default class PartyComponent extends React.PureComponent {

    state = {
        socket: null,
        activeUser: new activeUser(),
        deviceInfo: null,
        queue: new queue(),
        currentPlayingSong: ''
    }
  

    async getSpotifyDevices() {
        let responce =  await fetch(urls.SPOTDEVINFO, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.activeUser)
            })
        this.setState({deviceInfo: await responce.json()});
    }

    async selectSong(){
        //We should have this var as a parameter where we pass the id
        let tempSong = `spotify:track:4DTpngLjoHj5gFxEZFeD3J`;

        let responce =  await fetch(urls.SPOTSELECTSONG, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({songURI: tempSong , user: this.state.activeUser})
            })
        let finishedResponce = await responce.json();
        if (finishedResponce.sucessful){
            //only edit the queue if we are making a queue, selected song plays the song instantly so don't do this
            
            //edit the queue
            // let tempQueue = this.state.queue;
            // tempQueue.push(songTrack, finishedResponce.songInfo);
            //set state queue - 
            this.setState({ currentPlayingSong: finishedResponce.songInfo.name });
        }else{
            this.setState({currentPlayingSong: `Error: Song Cannot Be Played`});
        }
       
    }

    componentDidMount = () => {
        // connect to server
        const socket = io.connect('http://localhost:2500');

        socket.on("connectedSuccessfully", this.connectedSuccessfully)
        this.setState({ socket: socket });
    };

    connectedSuccessfully = dataFromServer => {
        this.setState({activeUser: dataFromServer})
    }




    render() {
     return(
         <div> 
            
              <div>
                <p>Your Room Name Is: {this.state.activeUser.room}</p>
                <button onClick={this.getSpotifyDevices.bind(this)} >Click To Get Devices</button>
                <button onClick={this.selectSong.bind(this)} >Click To Play Selected Song</button>
                <p>Logged in: Your receivedAccessToken Is {this.state.activeUser.access_token}</p>
             </div>
            { this.state.deviceInfo != undefined && (
                <div>
                    <p>Device Name: {this.state.deviceInfo[0].name}</p>
                    <p>Device Type: {this.state.deviceInfo[0].type}</p>
                    <p>Current Volume:  {this.state.deviceInfo[0].volume_percent}</p>
                    <p>Current Playing Song is: {this.state.currentPlayingSong}</p>
                </div>
            )
            }
            

         </div>
     );   
    }
}