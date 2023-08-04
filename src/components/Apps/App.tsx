import { Routes, Route } from 'react-router-dom'
import { Game, MainMenu, Page404, Test } from '@/components'


export function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path={import.meta.env.BASE_URL} element={<MainMenu />} />
        <Route path={import.meta.env.BASE_URL + '/game'} element={<Game />} />
        <Route path={import.meta.env.BASE_URL + '/test'} element={<Test />} />
        <Route path="/*" element={<Page404 />} />
      </Routes>
    </div>
  )
}
