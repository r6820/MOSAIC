import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { Game, Lobby, MainMenu, Online, Page404, Play } from '@/components'


export const App = () => {
  return (
    <div className='App'>
      <h1 className='text-4xl font-extrabold my-5'>
        MOSAIC
      </h1>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path='' element={<MainMenu />} />
          <Route path='/play' element={<Play />} />
          <Route path='/game' element={<Game />} />
          <Route path='/online' element={<Online />} />
          <Route path='/online/lobby' element={<Lobby />} />
          <Route path='/online/game' element={<Game />} />
          <Route path="/*" element={<Page404 />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
