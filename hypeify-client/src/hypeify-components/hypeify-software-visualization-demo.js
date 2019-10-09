import React from 'react';
import io from 'socket.io-client';

export default class VisualizationComponent extends React.PureComponent {
   
    state = {
        color: "white"
    };

   componentDidMount(){
    const socket = io.connect('http://localhost:8000');
    socket.on("beat", this.beatReact);
    //s
    
   }

   beatReact = dataFromServer => {
        console.log(dataFromServer.duration);
    
        this.setState({color: "black"})
        setTimeout(() => {
           this.setState({color: "white"})
        },
        dataFromServer.duration * 1000
        )
   };


  render(){
      const {color} = this.state;
        return (
            <div style={{backgroundColor: color}}>
                <p>
                Hypeify Visualation Component
                </p>
            </div>
        );
    }
};
