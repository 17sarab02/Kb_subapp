import { useState } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import KnowledgeBase from './components/KnowledgeBase'
import ViewKnowledgeBaseArticle from './components/ViewKnowledgeBaseArticle'
import CreateKnowledgeBaseArticle from './components/CreateKnowledgeBaseArticle'
import UpdateKnowledgeBaseArticle from './components/UpdateKnowledgeBaseArticle'

function App() {
  return (
    <div className='App'>
      <HashRouter>
        <Routes>
          <Route path="/kb">
            <Route index element={<KnowledgeBase />} />
            <Route path='view'>
              <Route path=':kbID' element={<ViewKnowledgeBaseArticle />}></Route>
            </Route>
            <Route path='update'>
              <Route path=':kbID' element={<UpdateKnowledgeBaseArticle />}></Route>
            </Route>
            <Route path='create' element={<CreateKnowledgeBaseArticle />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  )
}


export default App;
