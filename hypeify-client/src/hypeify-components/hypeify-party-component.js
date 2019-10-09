import React from "react";
import io from 'socket.io-client';

export default class PartyComponent extends React.PureComponent {

    state = {
        socket: null,
        receivedSocketID: null
    }

    componentDidMount = () => {
        // connect to server
        const socket = io.connect('http://localhost:2500');

        socket.on("connectedSuccessfully", this.connectedSuccessfully)
        this.setState({ socket: socket });
    };

    connectedSuccessfully = dataFromServer => {
        this.setState({receivedAccessToken: dataFromServer})
    }

    render() {
     return(
         <div>
             <p>Logged in: Your receivedAccessToken Is {this.state.receivedAccessToken}</p>
         </div>
     );   
    }
}