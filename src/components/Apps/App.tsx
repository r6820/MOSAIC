import { Routes, Route } from 'react-router-dom'
import { Game, MainMenu, Page404 } from '@/components'


export const App = () => {
  return (
    <div className='App'>
      <h1 className='text-4xl font-extrabold my-5'>
        MOSAIC
      </h1>
      <Routes>
        <Route path={import.meta.env.BASE_URL} element={<MainMenu />} />
        <Route path={import.meta.env.BASE_URL + '/game'} element={<Game />} />
        <Route path="/*" element={<Page404 />} />
      </Routes>
    </div>
  )
}
