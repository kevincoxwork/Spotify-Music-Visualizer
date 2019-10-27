const SERVER = "http://localhost:2500"; // development
// const SERVER = "/sprint";
//urls.js
//url constants

module.exports = {
  LOGIN: `${SERVER}/login`,
  TOKEN: `${SERVER}/token`,
  SPOTDEVINFO: `${SERVER}/spotifyDeviceInfo`,
  SPOTSELECTSONG: `${SERVER}/selectSong`,
  SPOTGETPLAYLISTS: `${SERVER}/getPlayLists`,
  SPOTGETPLAYLISTCONTENTS: `${SERVER}/getPlayListsContents`,
  SPOTSKIPTRACK: `${SERVER}/skipTrack`,
  SPOTPAUSETRACK: `${SERVER}/pauseTrack`,
  SPOTRESUMETRACK: `${SERVER}/resumeTrack`,
  SPOTDEVSTATUS: `${SERVER}/deviceStatus`,
  SPOTSEEKFORWARD: `${SERVER}/seekForward`,
  SPOTSEEKBACK: `${SERVER}/seekBack`
};
