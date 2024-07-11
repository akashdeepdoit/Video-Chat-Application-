import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../services/peer'
import { Typography , Button} from '@material-tailwind/react'
const RoomPage = () => {
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState()
    const [remoteStream,setRemoteStream]=useState()
    const socket = useSocket();


    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`)
        setRemoteSocketId(id)
    })

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            // audio: true,
            video: true,
        });
        const offer=await peer.getOffer();
        socket.emit("user:call",{to:remoteSocketId,offer})
        setMyStream(stream)
    }, [remoteSocketId,socket])
    
    const handleIncomingCall= useCallback(async ({from,offer})=>{
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            // audio: true,
            video: true,
        });
        setMyStream(stream)
        console.log("Incomming Call",from,offer)
        const ans=await peer.getAnswer(offer)
        socket.emit('call:accepted',{to:from,ans});

    },[]);


    const sendStreams=useCallback(()=>{
        for (const track of myStream.getTracks()){
            peer.peer.addTrack(track,myStream)
        }
    },[myStream])

    const handleCallAccepted=useCallback(({from,ans})=>{
        peer.setLocalDescription(ans)
        console.log('Call Accepted!')
        sendStreams()
        
    },[sendStreams])

    const handleNegoNeeded=useCallback(async()=>{
        const offer=await peer.getOffer();
        socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
       
    },[remoteSocketId,socket])


    const handleNegoNeededIncoming=useCallback(async({from,offer})=>{
        const ans=await peer.getAnswer(offer)
        socket.emit("peer:nego:done",{to:from,ans});
    },[socket])

    const handleNegoNeedFinal=useCallback(async ({ans})=>{
        await peer.setLocalDescription(ans)
    },[])

    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',handleNegoNeeded)
        return()=>{
            peer.peer.removeEventListener("negotiationneeded",handleNegoNeeded)
        }
    },[handleNegoNeeded])

    useEffect(()=>{
        peer.peer.addEventListener('track',async ev=>{
            const remoteStream=ev.streams
            console.log('GOT TRACKS')
            setRemoteStream(remoteStream[0])
        })
    },[])

    useEffect(() => {
        socket.on('user:joined', handleUserJoined)
        socket.on('incomming:call',handleIncomingCall)
        socket.on('call:accepted',handleCallAccepted)
        socket.on('peer:nego:needed',handleNegoNeededIncoming)
        socket.on('peer:nego:final',handleNegoNeedFinal)
        return () => {
            socket.off('user:joined', handleUserJoined)
            socket.off('incomming:call', handleIncomingCall)
            socket.off('call:accepted',handleCallAccepted)
            socket.off('peer:nego:needed',handleNegoNeededIncoming)
            socket.off('peer:nego:final',handleNegoNeedFinal)
        }
    }, [socket,handleUserJoined,handleIncomingCall,handleCallAccepted,handleNegoNeededIncoming,handleNegoNeedFinal])

    return (
        <div className='h-screen flex flex-col items-center justify-evenly' style={{
            "background": "linear-gradient(to right bottom, #8eabd1, #b0bedc, #cdd2e8, #e8e8f3, #ffffff)"}}>
            <Typography variant="h1" color="blue-gray">
                    Room
                </Typography>
            <h4>{remoteSocketId ? 'Connected' : '(No one in the room)'}</h4>
            
            <div className='flex flex-wrap xl:flex-row justify-center items-center'>

            
            {
                
                myStream && (
                    <div className='flex  justify-center flex-col items-center'>
                    <h1>My stream</h1>
                    <ReactPlayer
                        url={myStream}
                        playing
                        height="50vh"
                        width="50vw"
                         />
                    
                    </div>
                
                )
            }
            {
                remoteStream && (
                    <div className='flex justify-center flex-col items-center'>
                    <h1>Remote Stream</h1>
                    <ReactPlayer
                        url={remoteStream}
                        playing 
                        height="50vh"
                        width="50vw"
                    />
                    
                    </div>
                
                )

            }
            </div>
            <div className='flex w-full justify-center gap-10 m-10 '>
                {myStream && <Button onClick={sendStreams}>Send Stream</Button>}
                {remoteSocketId && <Button onClick={handleCallUser}>Call</Button>}
            </div>
        </div>
    )
}

export default RoomPage