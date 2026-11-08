// Starting point for Project 02 — FlowBoard.
// Read ASSIGNMENT.md and API.md before you start. Replace this file as you build the app.
import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-4 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">FlowBoard</h1>
      <p className="text-muted-foreground">
        Your project starts here. Read <code>ASSIGNMENT.md</code> and <code>API.md</code> for the
        requirements.
      </p>
      <div>
        <Button>shadcn/ui is ready</Button>
      </div>
    </main>
  )
}
