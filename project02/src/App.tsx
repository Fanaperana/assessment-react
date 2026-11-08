import { BrowserRouter, Route, Routes } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { Toaster } from '@/components/ui/sonner'
import { BoardListPage } from '@/features/boards/BoardListPage'
import { BoardPage } from '@/features/boards/BoardPage'
import { BoardsProvider } from '@/features/boards/BoardsContext'
import { CardDialog } from '@/features/cards/CardDialog'
import { ThemeProvider } from '@/hooks/ThemeProvider'

function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <a className="mt-4 inline-block underline" href="/">
        Back to boards
      </a>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BoardsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<BoardListPage />} />
              <Route path="boards/:boardId" element={<BoardPage />}>
                <Route path="cards/:cardId" element={<CardDialog />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </BoardsProvider>
    </ThemeProvider>
  )
}
