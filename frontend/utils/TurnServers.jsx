import axios from "axios";

let TurnIceServers = null;

export const fetchTurnCredentials = () => {
    return axios.get('https://www.pradeeps-video-conferencing.store/api/v1/TurnServers/').then((response) => {
        console.log(response.data)
        TurnIceServers = response.data
        return response.data
    }).catch((err)=>{
        alert('ice servers error')
    })
    

}

export const getTurnIceServers = () => {
    return TurnIceServers;
}