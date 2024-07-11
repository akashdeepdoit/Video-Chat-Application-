import React from 'react'
import { Routes,Route } from 'react-router'
import Lobby from './screens/Lobby'
import RoomPage from './screens/Room'
const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Lobby/>}/>
        <Route path='/room/:roodId' element={<RoomPage/>}/>
      </Routes>
    </div>
  )
}

export default App