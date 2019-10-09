import React from "react";
import io from 'socket.io-client';


const request = require('request');
const urls = require("./urls");

class activeUser {
    constructor(access_token, socket, name, room){
        this.access_token = access_token;
        this.socket = socket
        this.name = name;
        this.room = room;
    }
}



export default class PartyComponent extends React.PureComponent {

    state = {
        socket: null,
        activeUser: new activeUser(),
        deviceInfo: null
    }
  

    async getSpotifyDevices() {
       
        console.log(JSON.stringify(this.state.activeUser));

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
                <p>Logged in: Your receivedAccessToken Is {this.state.activeUser.access_token}</p>
             </div>
            { this.state.deviceInfo != undefined && (
                <div>
                    <p>Device Name: {this.state.deviceInfo[0].name}</p>
                    <p>Device Type: {this.state.deviceInfo[0].type}</p>
                    <p>Current Volume:  {this.state.deviceInfo[0].volume_percent}</p>
                </div>
            )
            }
            

         </div>
     );   
    }
}