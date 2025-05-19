import { Button } from '@auxarmory/ui/components/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <Button variant="default" className="mt-2">
        Click me!
      </Button>
    </div>
  )
}