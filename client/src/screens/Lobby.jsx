import React, { useEffect } from 'react'
import { useState, useCallback } from 'react'
import { useSocket } from '../context/SocketProvider'
import { useNavigate } from 'react-router'
import {
    Card,
    Input,
    Button,
    Typography,
} from "@material-tailwind/react";


const Lobby = () => {
    const socket = useSocket();
    const navigate = useNavigate();


    const [email, setEmail] = useState('')
    const [room, setRoom] = useState('')

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit("room:join", { email, room });

    }, [email, room, socket])

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data
        navigate(`/room/${room}`)
    }, [])

    useEffect(() => {
        socket.on("room:join", handleJoinRoom)
        return () => {
            socket.off("room:join", handleJoinRoom)
        }
    }, [socket])
    return (
        <div className='flex items-center justify-center h-screen' style={{
            "background": "linear-gradient(to right bottom, #8eabd1, #b0bedc, #cdd2e8, #e8e8f3, #ffffff)"}}>
            <Card color="transparent" shadow={false}>
                <Typography variant="h4" color="blue-gray">
                    Lobby
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                    Nice to meet you! Enter your details.
                </Typography>
                <form  className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
                    <div className="mb-1 flex flex-col gap-6">
                       
                        <Typography variant="h6" color="blue-gray" className="-mb-3">
                            Your Email
                        </Typography>
                        <Input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            type='email'
                            size="lg"
                            placeholder="name@mail.com"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "before:content-none after:content-none",
                            }}
                        />
                        <Typography variant="h6" color="blue-gray" className="-mb-3">
                            Create or Join Room
                        </Typography>
                        <Input
                            type="text"
                            size="lg"
                            placeholder="Enter a number"
                            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "before:content-none after:content-none",
                            }}
                            value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        />
                    </div>
                    
                    <Button onClick={handleSubmitForm} className="mt-6" fullWidth>
                        Enter
                    </Button>
                    
                </form>
            </Card>

        </div>
    )
}

export default Lobby