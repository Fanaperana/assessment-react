import { LayoutDashboard, Moon, Sun, ChevronsUpDown } from 'lucide-react'
import { Link, Outlet, useMatch } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useBoards } from '@/features/boards/useBoards'
import { useTheme } from '@/hooks/useTheme'

export function AppShell() {
  const { boards } = useBoards()
  const { theme, toggleTheme } = useTheme()
  const boardId = useMatch('/boards/:boardId/*')?.params.boardId
  const currentBoard = boards.find((board) => board.id === boardId)

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <LayoutDashboard className="size-5" />
              </span>
              <span className="text-lg">FlowBoard</span>
            </Link>
            <div className="mx-3 h-5 w-px bg-border max-sm:hidden" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="max-w-52 gap-2"
                  aria-label={`Switch board, ${currentBoard?.title ?? 'All boards'}`}
                >
                  <span className="truncate">{currentBoard?.title ?? 'All boards'}</span>
                  <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to="/">All boards</Link>
                </DropdownMenuItem>
                {boards.map((board) => (
                  <DropdownMenuItem key={board.id} asChild>
                    <Link to={`/boards/${board.id}`}>{board.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="ml-auto" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                >
                  {theme === 'dark' ? <Sun /> : <Moon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Switch to {theme === 'dark' ? 'light' : 'dark'} theme</TooltipContent>
            </Tooltip>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
