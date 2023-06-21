import { setMessages } from '../store/actions';
import { store } from '../store/store';
var time;
export const download = (worker, setGotFile, fileName) => {

    const streamSaver = require('streamsaver');

    const fileStream = streamSaver.createWriteStream(fileName);

    worker.current.postMessage("download");

    const listener = (event) => {
        const stream = event.data.stream();
        stream.pipeTo(fileStream);
        worker.current.removeEventListener("message", listener); // Remove the event listener
    };

    worker.current.addEventListener("message", listener);
};



export function handleReceiveData(worker, setGotFile, FileNameRef, data, FileSentBy, setProgress) {
    
    if (data.toString().includes('done')) {
        setGotFile(true);
        const parsed = JSON.parse(data);
        const FileData = {
            File: true,
            content: parsed.fileName,
            identity: parsed.identity,
            messageCreatedByMe: false
        }
        const messages = store.getState().messages
        store.dispatch(setMessages([...messages, FileData]))
        FileSentBy.current = parsed.identity
        FileNameRef.current = parsed.fileName;
        console.log('File transfer complete. Got File:', FileNameRef.current);
        setProgress.current = Date.now() - parsed.timeSent
        const timeTaken = Math.ceil(setProgress.current/1000)
        localStorage.setItem('File_Transfer_Time_Taken',timeTaken)
        time = timeTaken
        console.log(time)
    } else {
        console.time('timer started');
        worker.current.postMessage(data);
        worker.addEventListener('message',()=>{
            console.timeEnd('timer ended')
        })

    }
    
}
 
export function selectFile(setFile, e) {
    setFile(e.target.files[0]);
}

export function sendFile(File, peers, identity, setProgress) {
    
    setProgress.current = Date.now()
    const fileName = File.name;
    const FileData = {
        File: true,
        content: fileName,
        identity: identity,
        messageCreatedByMe: true
    }
    const messages = store.getState().messages
    store.dispatch(setMessages([...messages, FileData]))
    const stream = File.stream();
    const reader = stream.getReader();
    const peerList = Object.values(peers.current);
    const fileSize = File.size
    if (fileSize > 100 * 1024 * 1024) {
        alert('u can only share files of size below 100mb')
        return;
    }
    


    const optimalChunkSize = 256 * 1024
    console.log(Math.ceil(fileSize/optimalChunkSize))

    peerList.forEach((peer) => {
        
        sendChunks();

        async function sendChunks() {
           
            while (true) {
                const { done, value } = await reader.read();
                if (done) {

                    peer.write(JSON.stringify({ done: true, fileName, file: true, identity,timeSent:setProgress.current  }));   
                    const time = Date.now() - setProgress.current
                    console.log(time)
                    break;
                }

                let offset = 0;
                while (offset < value.length) {
                    const chunk = value.slice(offset, offset + optimalChunkSize);
                    peer.write(chunk, { file: true });
                    offset += optimalChunkSize;
                }
            }
            
        }

        peer.on('error', (error) => {
            console.error('Error occurred with peer:', error);

        });

        peer.on('close', (err) => {
            console.log('Peer connection closed', err);

        });        
    });
}