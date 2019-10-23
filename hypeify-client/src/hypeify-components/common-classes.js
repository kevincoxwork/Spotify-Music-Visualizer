
class activeUser {
    constructor(access_token, socket, name, room){
        this.access_token = access_token;
        this.socket = socket
        this.name = name;
        this.room = room
    }
}

class songTrack {
    constructor(id, name, uri){
        this.id = id;
        this.name =  name;
        this.uri = uri;
    }
}

export {songTrack, activeUser};